import { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function useMapInit(containerId) {
  const mapRef = useRef(null);
  
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map(containerId, {
        crs: L.CRS.EPSG4326,
        center: [33, 114],
        maxZoom: 18,
        zoom: 4
      });
    }
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [containerId]);

  return mapRef;
}