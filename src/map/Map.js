import React, { useState, useEffect, useRef } from 'react';
import { Popover } from "antd";
import L from 'leaflet';
import './map.css';
import '@supermapgis/iclient-leaflet';
import { TiledMapLayer } from '@supermapgis/iclient-leaflet';

export default function Map(props) {
	const mapRef = useRef(null);
	const mapContainerRef = useRef(null);
	const layersRef = useRef({});
	const [coordinate, setCoordinates] = useState({ lat: 0, lng: 0 });
	const [popupData, setPopupData] = useState({});
	const [activeMarker, setActiveMarker] = useState({ show: false });

	useEffect(() => {
		if (mapRef.current) return;

		const map = L.map('map', {
			crs: L.CRS.EPSG4326,
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
		// map.on('click', () => {
		// 	setActiveMarker({ show: false });
		// });

		const customIcon = L.icon({
			iconUrl: require('./img/定位.png'),
			shadowUrl: '/marker-shadow.png',
			iconSize: [35, 40],
		});

		let CD = L.marker([30.40, 104.04]).bindPopup('成都市');

		const highlightIcon = L.icon({
			iconUrl: require('./img/定位2.png'),
			iconSize: [40, 45]
		});

		const handleMarkerClick = (e) => {
			const { latlng } = e;
			setPopupData(e.target._popup)
			setCoordinates(latlng)

			const map = mapRef.current;
			const point = map.latLngToContainerPoint(latlng);

			setActiveMarker(prov => {
				return {
					position: point,
					content: '位置信息',
					coordinates: latlng,
					show: !prov?.show
				}
			});
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
			{activeMarker?.show && (
				<PopoverPlay
					position={activeMarker.position}
					content={activeMarker.content}
					coordinates={activeMarker.coordinates}
				/>
			)}
		</div>
	);
};

export function PopoverPlay({ position, content, coordinates }) {
	return (
		<div style={{
			position: 'absolute',
			right: position?.x,
			top: position?.y,
			background: 'white',
			padding: '10px',
			borderRadius: '5px',
			boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
			zIndex: 1000
		}}>
			<h3 style={{ margin: 0 }}>{content}</h3>
			<div>坐标：{coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}</div>
		</div>
	);
}