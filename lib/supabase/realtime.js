import { supabase } from "./index";

// 1) Messages
export const listenMessages = (callback) => {
  return supabase
    .channel("messages-ch")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "messages" },
      callback
    )
    .subscribe();
};

// 2) Orders
export const listenOrders = (callback) => {
  return supabase
    .channel("orders-ch")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "orders" },
      callback
    )
    .subscribe();
};

// 3) Order status
export const listenOrderStatus = (callback) => {
  return supabase
    .channel("order-status-ch")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "order_statuses" },
      callback
    )
    .subscribe();
};

// 4) Driver locations
export const listenDriverLocations = (callback) => {
  return supabase
    .channel("driver-locations-ch")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "driver_locations" },
      callback
    )
    .subscribe();
};

// 5) Service requests
export const listenServices = (callback) => {
  return supabase
    .channel("services-requests-ch")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "service_requests" },
      callback
    )
    .subscribe();
};

// 6) Products
export const listenProducts = (callback) => {
  return supabase
    .channel("products-ch")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "products" },
      callback
    )
    .subscribe();
};

// 7) Offers
export const listenOffers = (callback) => {
  return supabase
    .channel("offers-ch")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "offers" },
      callback
    )
    .subscribe();
};

// 8) Categories
export const listenCategories = (callback) => {
  return supabase
    .channel("categories-ch")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "categories" },
      callback
    )
    .subscribe();
};

// 9) Variants
export const listenVariants = (callback) => {
  return supabase
    .channel("variants-ch")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "product_variants" },
      callback
    )
    .subscribe();
};
