-- ============================================
-- SUPABASE FUNCTIONS FOR ALMA WORLD
-- ============================================
-- This file contains all the SQL functions needed for complex business logic
-- Copy and paste these functions into the Supabase SQL Editor and execute them

-- ============================================
-- 1. ORDER MANAGEMENT FUNCTIONS
-- ============================================

-- Function to calculate order total with tax and delivery fee
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
-- 2. TAXI/TRIP MANAGEMENT FUNCTIONS
-- ============================================

-- Function to find nearest available drivers
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
      POWER(SIN((dl.lat)::DECIMAL - pickup_lat) / 2, 2) +
      COS(pickup_lat) * COS((dl.lat)::DECIMAL) *
      POWER(SIN((dl.lng)::DECIMAL - pickup_lng) / 2, 2)
    )))::DECIMAL as distance_km,
    d.rating,
    d.vehicle_type
  FROM drivers d JOIN driver_locations dl ON d.id = dl.driver_id
  WHERE d.is_active = true
    AND (6371 * 2 * ASIN(SQRT(
      POWER(SIN((dl.lat)::DECIMAL - pickup_lat) / 2, 2) +
      COS(pickup_lat) * COS((dl.lat)::DECIMAL) *
      POWER(SIN((dl.lng)::DECIMAL - pickup_lng) / 2, 2)
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

-- Function to complete trip and update driver earnings
CREATE OR REPLACE FUNCTION complete_trip(
  trip_id UUID,
  driver_id UUID,
  fare_amount DECIMAL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update trip status
  UPDATE service_requests
  SET status = 'completed',
      payment_status = 'pending',
      updated_at = NOW()
  WHERE id = trip_id;

  -- Update driver earnings
  UPDATE drivers
  SET total_earnings = total_earnings + fare_amount,
      total_trips = total_trips + 1
  WHERE id = driver_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to get driver trip statistics
CREATE OR REPLACE FUNCTION get_driver_trip_stats(driver_id UUID)
RETURNS TABLE (
  total_trips BIGINT,
  completed_trips BIGINT,
  total_distance DECIMAL,
  total_earnings DECIMAL,
  average_rating DECIMAL,
  today_trips BIGINT,
  today_earnings DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_trips,
    COUNT(*) FILTER (WHERE status = 'completed')::BIGINT as completed_trips,
    COALESCE(SUM(distance), 0)::DECIMAL as total_distance,
    COALESCE(SUM(fare), 0)::DECIMAL as total_earnings,
    COALESCE(AVG(rating), 0)::DECIMAL as average_rating,
    COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE)::BIGINT as today_trips,
    COALESCE(SUM(fare) FILTER (WHERE DATE(created_at) = CURRENT_DATE), 0)::DECIMAL as today_earnings
  FROM service_requests
  WHERE driver_id = get_driver_trip_stats.driver_id;
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

-- Function to send trip status notification
CREATE OR REPLACE FUNCTION notify_trip_status_change(
  trip_id UUID,
  new_status VARCHAR
)
RETURNS VOID AS $$
DECLARE
  trip_record RECORD;
  notification_message VARCHAR;
BEGIN
  -- Get trip details
  SELECT id, user_id INTO trip_record
  FROM service_requests
  WHERE id = trip_id;

  -- Determine notification message based on status
  CASE new_status
    WHEN 'accepted' THEN
      notification_message := 'Your trip request has been accepted by a driver';
    WHEN 'in_progress' THEN
      notification_message := 'Your trip is now in progress';
    WHEN 'completed' THEN
      notification_message := 'Your trip has been completed';
    WHEN 'cancelled' THEN
      notification_message := 'Your trip has been cancelled';
    ELSE
      notification_message := 'Your trip status has been updated';
  END CASE;

  -- Create notification
  PERFORM create_notification(
    trip_record.user_id,
    'delivery',
    'Trip Status Update',
    notification_message,
    jsonb_build_object('tripId', trip_id, 'status', new_status)
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. PRODUCT MANAGEMENT FUNCTIONS
-- ============================================

-- Function to update product rating
CREATE OR REPLACE FUNCTION update_product_rating(product_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  avg_rating DECIMAL;
  review_count BIGINT;
BEGIN
  SELECT
    COALESCE(AVG(rating), 0)::DECIMAL,
    COUNT(*)::BIGINT
  INTO avg_rating, review_count
  FROM reviews
  WHERE product_id = update_product_rating.product_id;

  UPDATE products
  SET rating = avg_rating,
      review_count = review_count,
      updated_at = NOW()
  WHERE id = product_id;

  RETURN avg_rating;
END;
$$ LANGUAGE plpgsql;

-- Function to update vendor rating
CREATE OR REPLACE FUNCTION update_vendor_rating(vendor_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  avg_rating DECIMAL;
  review_count BIGINT;
BEGIN
  SELECT
    COALESCE(AVG(rating), 0)::DECIMAL,
    COUNT(*)::BIGINT
  INTO avg_rating, review_count
  FROM reviews
  WHERE vendor_id = update_vendor_rating.vendor_id;

  UPDATE vendors
  SET rating = avg_rating,
      review_count = review_count
  WHERE id = vendor_id;

  RETURN avg_rating;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. TRIGGERS (OPTIONAL - For Automation)
-- ============================================

-- Trigger to automatically notify when order status changes
CREATE OR REPLACE FUNCTION trigger_order_status_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
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

-- Trigger to automatically notify when trip status changes
CREATE OR REPLACE FUNCTION trigger_trip_status_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    PERFORM notify_trip_status_change(NEW.id, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for trip status changes
DROP TRIGGER IF EXISTS trip_status_notification ON trips;
CREATE TRIGGER trip_status_notification
AFTER UPDATE ON trips
FOR EACH ROW
EXECUTE FUNCTION trigger_trip_status_notification();

-- Trigger to update product rating when review is added/updated
CREATE OR REPLACE FUNCTION trigger_update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.product_id IS NOT NULL THEN
    PERFORM update_product_rating(NEW.product_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for product rating updates
DROP TRIGGER IF EXISTS update_product_rating_trigger ON reviews;
CREATE TRIGGER update_product_rating_trigger
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION trigger_update_product_rating();

-- Trigger to update vendor rating when review is added/updated
CREATE OR REPLACE FUNCTION trigger_update_vendor_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.vendor_id IS NOT NULL THEN
    PERFORM update_vendor_rating(NEW.vendor_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vendor rating updates
DROP TRIGGER IF EXISTS update_vendor_rating_trigger ON reviews;
CREATE TRIGGER update_vendor_rating_trigger
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION trigger_update_vendor_rating();

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Users can only see their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only see their own trips
CREATE POLICY "Users can view own trips"
  ON trips FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only see reviews for their own orders
CREATE POLICY "Users can view own reviews"
  ON reviews FOR SELECT
  USING (auth.uid() = user_id);

-- Products are readable by all authenticated users
CREATE POLICY "Products are readable by all"
  ON products FOR SELECT
  USING (true);

-- Categories are readable by all authenticated users
CREATE POLICY "Categories are readable by all"
  ON categories FOR SELECT
  USING (true);

-- Vendors are readable by all authenticated users
CREATE POLICY "Vendors are readable by all"
  ON vendors FOR SELECT
  USING (true);

-- Drivers are readable by all authenticated users (for trip requests)
CREATE POLICY "Drivers are readable by all"
  ON drivers FOR SELECT
  USING (true);

-- ============================================
-- END OF SUPABASE FUNCTIONS
-- ============================================
