import { useEffect } from 'react';
import { BASE_LAYERS } from '../constants';

export default function LayerManager({ map, activeLayer }) {
  useEffect(() => {
    if (!map) return;
    
    const layers = Object.entries(BASE_LAYERS).map(([name, config]) => 
      L.supermap.TiledMapLayer(config.url, config.options)
    );
    
    layers[0].addTo(map);
    return () => layers.forEach(layer => layer.remove());
  }, [map, activeLayer]);

  return null;
}