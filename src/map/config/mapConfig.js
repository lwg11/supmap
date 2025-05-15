import { key } from '../config';

export const MAP_CONFIG = {
  crs: L.supermap.CRS.TianDiTu_Mercator,
  center: [33, 114],
  maxZoom: 18,
  zoom: 5,
};

export const BASE_LAYERS = {
  vec: {
    type: 'TiandituTileLayer',
    options: {
      layerType: 'vec',
      key,
    },
  },
  img: {
    type: 'TiandituTileLayer',
    options: {
      layerType: 'img',
      key,
    },
  },
};

export const BASE_LAYERS_LABEL = {
  vec: {
    type: 'TiandituTileLayer',
    options: {
      layerType: 'vec',
      isLabel: true,
      key,
    },
  },
  img: {
    type: 'TiandituTileLayer',
    options: {
      layerType: 'img',
      isLabel: true,
      key,
    },
  },
};

export const HIGHLIGHT_STYLE = {
  fillColor: '#800026',
  fillOpacity: 0.5,
  stroke: true,
  fill: true,
  color: 'red',
  opacity: 1,
  weight: 2,
};
