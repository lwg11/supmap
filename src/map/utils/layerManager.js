import L from 'leaflet';

/**
 * 通用图层管理函数
 * @param map 地图实例
 * @param baseLayers 底图集合
 * @param labelLayers 标注图层集合
 * @param activeBase 激活的底图Key
 * @param overlayLayers 叠加图层集合
 * @param activeOverlays 激活的叠加图层Key数组
 */
export const manageLayers = (
  map,
  baseLayers,
  labelLayers,
  activeBase,
  overlayLayers,
  activeOverlays
) => {
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
