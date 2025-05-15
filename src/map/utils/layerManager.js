import L from 'leaflet';

/**
 * 通用图层管理函数
 */
export const manageLayers = (
  map,
  baseLayers,
  labelLayers,
  activeBase,
  overlayLayers,
  activeOverlays
) => {
  console.log('activeBase==>++',activeBase);
  
  const removeLayers = (layers) => {
    Object.values(layers).forEach(layer => layer?.removeFrom(map));
  };

  removeLayers(baseLayers);
  removeLayers(labelLayers);
  baseLayers[activeBase]?.addTo(map);
  labelLayers[activeBase]?.addTo(map);

  Object.entries(overlayLayers).forEach(([name, layer]) => {
    activeOverlays.includes(name) ? layer.addTo(map) : layer.removeFrom(map);
  });
};
