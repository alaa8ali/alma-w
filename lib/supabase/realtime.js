import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 🟢 1) Realtime : الرسائل
export const listenMessages = (callback) => {
  return supabase
    .channel("messages-ch")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "messages" },
      (payload) => callback(payload)
    )
    .subscribe();
};

// 🟢 2) Realtime : الطلبات
export const listenOrders = (callback) => {
  return supabase
    .channel("orders-ch")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "orders" },
      (payload) => callback(payload)
    )
    .subscribe();
};

// 🟢 3) Realtime : حالة الطلب
export const listenOrderStatus = (callback) => {
  return supabase
    .channel("order-status-ch")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "order_statuses" },
      (payload) => callback(payload)
    )
    .subscribe();
};

// 🟢 4) Realtime : مواقع السائقين
export const listenDriverLocations = (callback) => {
  return supabase
    .channel("driver-locations-ch")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "driver_locations" },
      (payload) => callback(payload)
    )
    .subscribe();
};

// 🟢 5) Realtime : طلبات الخدمات المنزلية
export const listenServices = (callback) => {
  return supabase
    .channel("services-requests-ch")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "service_requests" },
      (payload) => callback(payload)
    )
    .subscribe();
};

// 🟢 6) Realtime : المنتجات
export const listenProducts = (callback) => {
  return supabase
    .channel("products-ch")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "products" },
      (payload) => callback(payload)
    )
    .subscribe();
};

// 🟢 7) Realtime : العروض
export const listenOffers = (callback) => {
  return supabase
    .channel("offers-ch")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "offers" },
      (payload) => callback(payload)
    )
    .subscribe();
};

// 🟢 8) Realtime : الفئات
export const listenCategories = (callback) => {
  return supabase
    .channel("categories-ch")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "categories" },
      (payload) => callback(payload)
    )
    .subscribe();
};

// 🟢 9) Realtime : الأحجام والأسعار
export const listenVariants = (callback) => {
  return supabase
    .channel("variants-ch")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "product_variants" },
      (payload) => callback(payload)
    )
    .subscribe();
};

export default supabase;
