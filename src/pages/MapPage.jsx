import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import supabase from "../lib/supabase/realtime";

// 🔵 أيقونة السائق
const driverIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// 🔵 نقطة بداية الخريطة (مثلاً الأردن)
const DEFAULT_POSITION = [32.0, 36.0];

export default function MapPage() {
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    // جلب أولي لمواقع السائقين
    const fetchDrivers = async () => {
      const { data, error } = await supabase
        .from("driver_locations")
        .select("*");

      if (!error && data) {
        setDrivers(data);
      }
    };

    fetchDrivers();

    // 🟢 متابعة التحديثات Live من Supabase
    const subscription = supabase
      .channel("driver-locations-ch")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "driver_locations" },
        (payload) => {
          setDrivers((prev) => {
            const updated = [...prev];
            const index = updated.findIndex(
              (d) => d.driver_id === payload.new.driver_id
            );

            if (index !== -1) {
              updated[index] = payload.new;
            } else {
              updated.push(payload.new);
            }

            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer
        center={DEFAULT_POSITION}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        {/* خريطة OpenStreetMap */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        {/* عرض السائقين */}
        {drivers.map((driver) => (
          <Marker
            key={driver.driver_id}
            position={[driver.latitude, driver.longitude]}
            icon={driverIcon}
          >
            <Popup>
              <b>Driver ID:</b> {driver.driver_id} <br />
              <b>Last update:</b> {driver.updated_at}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
