-- ============================================
-- SUPABASE FUNCTIONS FOR ALMA WORLD (V2 - Corrected)
-- ============================================
-- This file contains all the SQL functions and RLS policies needed for complex business logic.
-- Copy and paste these functions into the Supabase SQL Editor and execute them.

-- ============================================
-- 1. ORDER MANAGEMENT FUNCTIONS
-- ============================================

-- Function to calculate order total with tax and shipping fee
CREATE OR REPLACE FUNCTION calculate_order_total(
  subtotal DECIMAL,
  shipping_fee DECIMAL DEFAULT 10,
  tax_rate DECIMAL DEFAULT 0.1,
  discount DECIMAL DEFAULT 0
)
RETURNS DECIMAL AS $$
BEGIN
  RETURN subtotal + (subtotal * tax_rate) + shipping_fee - discount;
END;
$$ LANGUAGE plpgsql;

-- Function to validate and apply coupon to order
CREATE OR REPLACE FUNCTION apply_coupon_to_order(
  coupon_code VARCHAR,
  order_subtotal DECIMAL
)
RETURNS TABLE (
  valid BOOLEAN,
  discount_amount DECIMAL,
  message VARCHAR
) AS $$
DECLARE
  coupon_record RECORD;
  discount_amount DECIMAL;
BEGIN
  -- Get coupon details
  SELECT * INTO coupon_record
  FROM coupons
  WHERE code = coupon_code
    AND is_active = true
    AND valid_until > NOW()
    AND used_count < usage_limit;

  IF coupon_record IS NULL THEN
    RETURN QUERY SELECT false, 0::DECIMAL, 'Coupon code is invalid or expired'::VARCHAR;
    RETURN;
  END IF;

  -- Check minimum order amount
  IF order_subtotal < coupon_record.min_order_amount THEN
    RETURN QUERY SELECT false, 0::DECIMAL, 
      CONCAT('Minimum order amount is ', coupon_record.min_order_amount)::VARCHAR;
    RETURN;
  END IF;

  -- Calculate discount
  IF coupon_record.discount_type = 'percentage' THEN
    discount_amount := (order_subtotal * coupon_record.discount_value) / 100;
    IF coupon_record.max_discount IS NOT NULL THEN
      discount_amount := LEAST(discount_amount, coupon_record.max_discount);
    END IF;
  ELSE
    discount_amount := coupon_record.discount_value;
  END IF;

  -- Increment usage count
  UPDATE coupons
  SET used_count = used_count + 1
  WHERE code = coupon_code;

  RETURN QUERY SELECT true, discount_amount, 'Coupon applied successfully'::VARCHAR;
END;
$$ LANGUAGE plpgsql;

-- Function to update order status and create tracking update
CREATE OR REPLACE FUNCTION update_order_status(
  order_id UUID,
  new_status VARCHAR,
  message VARCHAR DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  tracking_message VARCHAR;
BEGIN
  IF message IS NULL THEN
    tracking_message := CONCAT('Order status updated to ', new_status);
  ELSE
    tracking_message := message;
  END IF;

  -- Update order status
  UPDATE orders
  SET status = new_status,
      updated_at = NOW()
  WHERE id = order_id;

  -- Add tracking update
  UPDATE orders
  SET tracking_updates = array_append(
    COALESCE(tracking_updates, ARRAY[]::JSONB[]),
    jsonb_build_object(
      'status', new_status,
      'timestamp', NOW(),
      'message', tracking_message
    )
  )
  WHERE id = order_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to get order statistics for branch
CREATE OR REPLACE FUNCTION get_branch_order_stats(branch_id UUID)
RETURNS TABLE (
  total_orders BIGINT,
  total_revenue DECIMAL,
  average_order_value DECIMAL,
  pending_orders BIGINT,
  completed_orders BIGINT,
  today_orders BIGINT,
  today_revenue DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_orders,
    COALESCE(SUM(total), 0)::DECIMAL as total_revenue,
    COALESCE(AVG(total), 0)::DECIMAL as average_order_value,
    COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_orders,
    COUNT(*) FILTER (WHERE status = 'delivered')::BIGINT as completed_orders,
    COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE)::BIGINT as today_orders,
    COALESCE(SUM(total) FILTER (WHERE DATE(created_at) = CURRENT_DATE), 0)::DECIMAL as today_revenue
  FROM orders
  WHERE branch_id = get_branch_order_stats.branch_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. TAXI/SERVICE REQUEST MANAGEMENT FUNCTIONS
-- ============================================

-- Function to find nearest available drivers (Haversine Formula Corrected)
CREATE OR REPLACE FUNCTION find_nearest_drivers(
  pickup_lat DECIMAL,
  pickup_lng DECIMAL,
  radius_km DECIMAL DEFAULT 5,
  limit_count INT DEFAULT 5
)
RETURNS TABLE (
  driver_id UUID,
  driver_name VARCHAR,
  distance_km DECIMAL,
  rating DECIMAL,
  vehicle_type VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.full_name,
    (6371 * 2 * ASIN(SQRT(
      POWER(SIN(RADIANS((dl.lat)::DECIMAL - pickup_lat)) / 2, 2) +
      COS(RADIANS(pickup_lat)) * COS(RADIANS((dl.lat)::DECIMAL)) *
      POWER(SIN(RADIANS((dl.lng)::DECIMAL - pickup_lng)) / 2, 2)
    )))::DECIMAL as distance_km,
    d.rating,
    d.vehicle_type
  FROM drivers d JOIN driver_locations dl ON d.id = dl.driver_id
  WHERE d.is_active = true
    AND (6371 * 2 * ASIN(SQRT(
      POWER(SIN(RADIANS((dl.lat)::DECIMAL - pickup_lat)) / 2, 2) +
      COS(RADIANS(pickup_lat)) * COS(RADIANS((dl.lat)::DECIMAL)) *
      POWER(SIN(RADIANS((dl.lng)::DECIMAL - pickup_lng)) / 2, 2)
    ))) <= radius_km
  ORDER BY distance_km ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate trip fare based on distance
CREATE OR REPLACE FUNCTION calculate_trip_fare(
  distance_km DECIMAL,
  base_fare DECIMAL DEFAULT 5,
  per_km_rate DECIMAL DEFAULT 2.5,
  surge_multiplier DECIMAL DEFAULT 1.0
)
RETURNS DECIMAL AS $$
BEGIN
  RETURN ROUND((base_fare + (distance_km * per_km_rate)) * surge_multiplier, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to complete service_requests and update driver earnings
CREATE OR REPLACE FUNCTION complete_service_requests(
  request_id UUID,
  driver_id UUID,
  fare_amount DECIMAL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update service_requests status
  UPDATE service_requests
  SET status = 'completed',
      payment_status = 'pending',
      updated_at = NOW()
  WHERE id = request_id;

  -- Update driver earnings
  UPDATE drivers
  SET total_earnings = total_earnings + fare_amount,
      total_service_requests = total_service_requests + 1
  WHERE id = driver_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to get driver service_requests statistics
CREATE OR REPLACE FUNCTION get_driver_service_requests_stats(driver_id UUID)
RETURNS TABLE (
  total_service_requests BIGINT,
  completed_service_requests BIGINT,
  total_distance DECIMAL,
  total_earnings DECIMAL,
  average_rating DECIMAL,
  today_service_requests BIGINT,
  today_earnings DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_service_requests,
    COUNT(*) FILTER (WHERE status = 'completed')::BIGINT as completed_service_requests,
    COALESCE(SUM(distance), 0)::DECIMAL as total_distance,
    COALESCE(SUM(fare), 0)::DECIMAL as total_earnings,
    COALESCE(AVG(rating), 0)::DECIMAL as average_rating,
    COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE)::BIGINT as today_service_requests,
    COALESCE(SUM(fare) FILTER (WHERE DATE(created_at) = CURRENT_DATE), 0)::DECIMAL as today_earnings
  FROM service_requests
  WHERE driver_id = get_driver_service_requests_stats.driver_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. NOTIFICATION FUNCTIONS
-- ============================================

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  user_id UUID,
  notification_type VARCHAR,
  title VARCHAR,
  message VARCHAR,
  data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, data, is_read)
  VALUES (user_id, notification_type, title, message, data, false)
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to send order status notification
CREATE OR REPLACE FUNCTION notify_order_status_change(
  order_id UUID,
  new_status VARCHAR
)
RETURNS VOID AS $$
DECLARE
  order_record RECORD;
  notification_message VARCHAR;
BEGIN
  -- Get order details
  SELECT id, user_id, order_number INTO order_record
  FROM orders
  WHERE id = order_id;

  -- Determine notification message based on status
  CASE new_status
    WHEN 'confirmed' THEN
      notification_message := CONCAT('Your order #', order_record.order_number, ' has been confirmed');
    WHEN 'preparing' THEN
      notification_message := CONCAT('Your order #', order_record.order_number, ' is being prepared');
    WHEN 'ready' THEN
      notification_message := CONCAT('Your order #', order_record.order_number, ' is ready for pickup');
    WHEN 'out_for_delivery' THEN
      notification_message := CONCAT('Your order #', order_record.order_number, ' is on its way');
    WHEN 'delivered' THEN
      notification_message := CONCAT('Your order #', order_record.order_number, ' has been delivered');
    WHEN 'cancelled' THEN
      notification_message := CONCAT('Your order #', order_record.order_number, ' has been cancelled');
    ELSE
      notification_message := CONCAT('Your order #', order_record.order_number, ' status has been updated');
  END CASE;

  -- Create notification
  PERFORM create_notification(
    order_record.user_id,
    'order',
    'Order Status Update',
    notification_message,
    jsonb_build_object('orderId', order_id, 'status', new_status)
  );
END;
$$ LANGUAGE plpgsql;

-- Function to send service_requests status notification
CREATE OR REPLACE FUNCTION notify_service_requests_status_change(
  request_id UUID,
  new_status VARCHAR
)
RETURNS VOID AS $$
DECLARE
  request_record RECORD;
  notification_message VARCHAR;
BEGIN
  -- Get service_requests details
  SELECT id, user_id INTO request_record
  FROM service_requests
  WHERE id = request_id;

  -- Determine notification message based on status
  CASE new_status
    WHEN 'accepted' THEN
      notification_message := 'Your service request has been accepted by a driver';
    WHEN 'in_progress' THEN
      notification_message := 'Your service is now in progress';
    WHEN 'completed' THEN
      notification_message := 'Your service has been completed';
    WHEN 'cancelled' THEN
      notification_message := 'Your service request has been cancelled';
    ELSE
      notification_message := 'Your service request status has been updated';
  END CASE;

  -- Create notification
  PERFORM create_notification(
    request_record.user_id,
    'service',
    'Service Status Update',
    notification_message,
    jsonb_build_object('requestId', request_id, 'status', new_status)
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. TRIGGERS
-- ============================================

-- Trigger function for order status notification
CREATE OR REPLACE FUNCTION trigger_order_status_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Safety check: Avoid infinite loop by ensuring the status has actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM notify_order_status_change(NEW.id, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for order status changes
DROP TRIGGER IF EXISTS order_status_notification ON orders;
CREATE TRIGGER order_status_notification
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION trigger_order_status_notification();

-- Trigger function for service_requests status notification
CREATE OR REPLACE FUNCTION trigger_service_requests_status_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Safety check: Avoid infinite loop by ensuring the status has actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM notify_service_requests_status_change(NEW.id, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for service_requests status changes
DROP TRIGGER IF EXISTS service_requests_status_notification ON service_requests;
CREATE TRIGGER service_requests_status_notification
AFTER UPDATE ON service_requests
FOR EACH ROW
EXECUTE FUNCTION trigger_service_requests_status_notification();

-- Trigger to update product rating when review is added/updated
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET
    rating = (SELECT AVG(rating) FROM reviews WHERE product_id = NEW.product_id),
    review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id)
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for review changes
DROP TRIGGER IF EXISTS review_update_product_rating ON reviews;
CREATE TRIGGER review_update_product_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_product_rating();

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS VARCHAR AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

-- 5.1. Users Table Policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Admin can view all users
CREATE POLICY "Admin can view all users"
  ON users FOR SELECT
  USING (get_user_role() = 'admin');

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- 5.2. Products, Categories, Branches Policies (Public Read Access)
-- Products: Enable read access for all users (Public)
CREATE POLICY "Products are public"
  ON products FOR SELECT
  USING (true);

-- Categories: Enable read access for all users (Public)
CREATE POLICY "Categories are public"
  ON categories FOR SELECT
  USING (true);

-- Branches: Enable read access for all users (Public)
CREATE POLICY "Branches are public"
  ON branches FOR SELECT
  USING (true);

-- Admin/Vendor can manage products
CREATE POLICY "Admin and Vendor can manage products"
  ON products FOR ALL
  USING (get_user_role() IN ('admin', 'vendor'))
  WITH CHECK (get_user_role() IN ('admin', 'vendor'));

-- 5.3. Orders Policies
-- Admin/Vendor/Delivery can view all orders, Users can view own orders
CREATE POLICY "Orders: Role-based read access"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR get_user_role() IN ('admin', 'vendor', 'delivery'));

-- Users can create orders
CREATE POLICY "Orders: Users can create"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin/Vendor/Delivery can update order status
CREATE POLICY "Orders: Role-based update status"
  ON orders FOR UPDATE
  USING (get_user_role() IN ('admin', 'vendor', 'delivery'));

-- 5.4. Service Requests Policies
-- Admin/Driver can view all service_requests, Users can view own service_requests
CREATE POLICY "Service Requests: Role-based read access"
  ON service_requests FOR SELECT
  USING (auth.uid() = user_id OR get_user_role() IN ('admin', 'driver'));

-- Users can create service_requests
CREATE POLICY "Service Requests: Users can create"
  ON service_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin/Driver can update service_requests status
CREATE POLICY "Service Requests: Role-based update status"
  ON service_requests FOR UPDATE
  USING (get_user_role() IN ('admin', 'driver'));

-- 5.5. Notifications Policies
-- Admin can view all notifications, Users can view own notifications
CREATE POLICY "Notifications: Role-based read access"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id OR get_user_role() = 'admin');

-- Users can update their own notifications (mark as read)
CREATE POLICY "Notifications: Users can update own"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- 5.6. Reviews Policies
-- Reviews are public (read access for all)
CREATE POLICY "Reviews are public"
  ON reviews FOR SELECT
  USING (true);

-- Users can create reviews
CREATE POLICY "Reviews: Users can create"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Reviews: Users can update own"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Reviews: Users can delete own"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);
