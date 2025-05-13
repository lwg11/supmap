export const HOST = "https://iserver.supermap.io";
export const BASE_LAYERS = {
  China: {
    url: `${HOST}/iserver/services/map-china400/rest/maps/China_4326`,
    options: { noWrap: true }
  },
  beijing: {
    url: `${HOST}/iserver/services/map-jingjin/rest/maps/京津地区地图`,
    options: { noWrap: true }
  }
};