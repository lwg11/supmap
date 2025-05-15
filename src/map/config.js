const smHost = 'https://iserver.supermap.io'
const jj = smHost + '/iserver/services/map-Jingjin/rest/maps/京津地区地图'
const BOUNDARY_LAYER_URL = smHost + '/iserver/services/map-china400/rest/maps/China';
// supermap uil
const BASEMAP_URL = smHost + '/iserver/services/map-world/rest/maps/World';
// const BASEMAP_URL = smHost + '/iserver/services/map-Jingjin/rest/maps/京津地区地图'

const baseMapData = { "tianditu": "天地图", "supermap": "supermap" };
const baseLayersData = { "vec": "矢量地图", "img": "影像地图" };
const overlayLayersData = { "标记": "城市标记", "jj图层": "JJ 图层", "行政区划": "省级边界" };

const key = '38c85d6a0ba2503c80c339d1a9c684b3';
// const key = 'd9ca48dbdb5340a322938f75d26e11fd';

export {
    smHost,
    BOUNDARY_LAYER_URL,
    jj,
    baseMapData,
    baseLayersData,
    overlayLayersData,
    BASEMAP_URL,
    key
};