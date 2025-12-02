import { useEffect, useRef, useState } from 'react';
import { supabase } from './index';

/**
 * useDriverLocations
 * - يعيد خريطة (object) من السائقين { driver_id: {lat,lng,updated_at, ...} }
 * - يدير الاشتراك Realtime أوتوماتيكياً
 */
export function useDriverLocations() {
  const [drivers, setDrivers] = useState({});
  const channelRef = useRef(null);

  // initial load
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from('driver_locations')
        .select('driver_id, lat, lng, updated_at')
        .limit(500);

      if (error) {
        console.error('Initial fetch driver_locations error:', error);
        return;
      }
      if (!mounted) return;

      const initial = {};
      data.forEach((r) => {
        initial[r.driver_id] = {
          lat: Number(r.lat),
          lng: Number(r.lng),
          updated_at: r.updated_at,
        };
      });
      setDrivers(initial);
    })();

    return () => { mounted = false; };
  }, []);

  // realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('public:driver_locations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'driver_locations' },
        (payload) => {
          try {
            const { eventType, new: newRow, old: oldRow } = payload;
            if (eventType === 'DELETE') {
              const removedId = oldRow?.driver_id;
              if (!removedId) return;
              setDrivers((prev) => {
                const copy = { ...prev };
                delete copy[removedId];
                return copy;
              });
              return;
            }
            if (!newRow) return;
            const id = newRow.driver_id;
            setDrivers((prev) => ({
              ...prev,
              [id]: {
                lat: Number(newRow.lat),
                lng: Number(newRow.lng),
                updated_at: newRow.updated_at,
              },
            }));
          } catch (err) {
            console.error('driver_locations payload error:', err);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  return { drivers, rawChannel: channelRef.current };
}
