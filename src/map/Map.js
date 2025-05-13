import React, { useState, useEffect, useRef } from 'react';
import { Popover } from "antd";
import L from 'leaflet';
import './map.css';
import '@supermapgis/iclient-leaflet';
import { TiledMapLayer } from '@supermapgis/iclient-leaflet';

// import useMapInit from './hooks/useMapInit';
// import LayerManager from './components/LayerManager';
// import Controls from './components/Controls';
// import { useMarkers } from './utils/markers';

const host = "https://iserver.supermap.io";

export default function Map(props) {
	const mapRef = useRef(null);
	const mapContainerRef = useRef(null);
	const layersRef = useRef({});
	const [coordinate, setCoordinates] = useState({ lat: 0, lng: 0 });
	const [popupData, setPopupData] = useState({});

	useEffect(() => {
		if (mapRef.current) return;

		const map = L.map('map', {
			crs: L.CRS.EPSG4326,
			// center: [40, 117],
			center: [33, 114],
			maxZoom: 18,
			zoom: 4,
		});

		const baseLayers = {
			"China": new L.supermap.TiledMapLayer(
				'https://iserver.supermap.io/iserver/services/map-china400/rest/maps/China_4326',
				{ noWrap: true }
			),
			"beijing": new L.supermap.TiledMapLayer(
				'https://iserver.supermap.io/iserver/services/map-jingjin/rest/maps/京津地区地图',
				{ noWrap: true }
			),
		};
		baseLayers.China.addTo(map);
		layersRef.current = baseLayers;
		mapRef.current = map;

		L.control.layers(baseLayers).addTo(map);
		L.control.scale().addTo(map);

		const customIcon = L.icon({
			iconUrl: require('./img/定位.png'),
			shadowUrl: '/marker-shadow.png',
			iconSize: [35, 40], // 图标尺寸
		});

		let CD = L.marker([30.40, 104.04]).bindPopup('成都市');


		const highlightIcon = L.icon({
			iconUrl: require('./img/定位2.png'),
			iconSize: [40, 45]
		});

		const handleMarkerClick = (e) => {
			const { latlng } = e;
			console.log('dianji--->',e);
			setPopupData(e.target._popup)
			setCoordinates(latlng)
		};

		const handleMarkerHover = (e) => {
			const { target } = e;
			target.setIcon(highlightIcon);
		};

		const handleMarkerLeave = (e) => {
			e.target.setIcon(customIcon);
		}

		const bindMarkerEvents = (marker) => {
			marker
				.on('click', handleMarkerClick)
				.on('mouseover', handleMarkerHover)
				.on('mouseout', handleMarkerLeave);
		}

		var BJ = L.marker([39.830660058696104, 116.92866163503169], {
			icon: customIcon

		}).bindPopup('北京市');
		bindMarkerEvents(BJ);



		let cities = L.layerGroup([BJ, CD]).addTo(map);

		L.control.layers(baseLayers, {
			"标记": cities
		}).addTo(map);

		return () => {
			map.remove();
			mapRef.current = null;
			// 清理图层
			Object.values(layersRef.current).forEach(layer => layer.remove());
		};
	}, []);



	return (
		<div className='flex' style={{ width: "100%", height: "100%" }}>
			<div>
				<div className='flex'>坐标:</div>
				<div className='flex'>{popupData?._content}</div>
				<div>{coordinate.lat},{coordinate.lng}</div>
			</div>
			<div
				ref={mapContainerRef}
				id="map"
				style={{ position: "absolute", top: '20px', right: '20px', width: "900px", height: "600px" }}
			></div>
		</div>
	);
};