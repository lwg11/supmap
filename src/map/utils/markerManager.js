import L from 'leaflet';

export const createMarkers = (mapRef, setPopupData, setCoordinates, setActiveMarker) => {
  const customIcon = L.icon({
    iconUrl: require('../img/定位.png'),
    shadowUrl: '/marker-shadow.png',
    iconSize: [35, 40],
  });

  const highlightIcon = L.icon({
    iconUrl: require('../img/定位2.png'),
    iconSize: [40, 45]
  });

  const CD = L.marker([30.40, 104.04]).bindPopup('成都市');
  const BJ = L.marker([39.830660058696104, 116.92866163503169], {
    icon: customIcon
  }).bindPopup('北京市');

  const handleMarkerEvent = (marker) => {
    marker.on('click', (e) => {
      const { latlng } = e;
      setPopupData(e.target._popup);
      setCoordinates(latlng);
      const point = mapRef.current?.latLngToContainerPoint(latlng);
      setActiveMarker(prev => ({
        ...prev,
        position: point,
        content: '位置信息',
        coordinates: latlng,
        show: !prev.show
      }));
    }).on('mouseover', (e) => {
      e.target.setIcon(highlightIcon);
    }).on('mouseout', (e) => {
      e.target.setIcon(customIcon);
    });
  };

  handleMarkerEvent(BJ);
  handleMarkerEvent(CD);

  return L.layerGroup([BJ, CD]);
};
