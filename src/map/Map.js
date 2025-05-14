import React, { useState, useEffect, useRef } from 'react';
import { Popover } from "antd";
import L from 'leaflet';
import './map.css';
import '@supermapgis/iclient-leaflet';
import { TiledMapLayer } from '@supermapgis/iclient-leaflet';

// 自定义图层切换控件组件
const LayerControl = ({ baseLayers, overlayLayers, onBaseLayerChange, onOverlayLayerChange }) => {
	return (
		<div style={{ top: '20px', left: '20px', zIndex: 1000, background: 'white', padding: '10px', borderRadius: '5px' }}>
			<h4>底图</h4>
			{Object.entries(baseLayers).map(([name, layer]) => (
				<div key={name}>
					<input
						type="radio"
						id={name}
						name="baseLayer"
						onChange={() => onBaseLayerChange(name)}
					/>
					<label htmlFor={name}>{name}</label>
				</div>
			))}
			<h4>图层</h4>
			{Object.entries(overlayLayers).map(([name, layer]) => (
				<div key={name}>
					<input
						type="checkbox"
						id={name}
						onChange={() => onOverlayLayerChange(name)}
					/>
					<label htmlFor={name}>{name}</label>
				</div>
			))}
		</div>
	);
};

export default function Map(props) {
	const mapRef = useRef(null);
	const mapContainerRef = useRef(null);
	const layersRef = useRef({});
	const [coordinate, setCoordinates] = useState({ lat: 0, lng: 0 });
	const [popupData, setPopupData] = useState({});
	const [activeMarker, setActiveMarker] = useState({ show: false });
	let key = 'd9ca48dbdb5340a322938f75d26e11fd';

	const [activeBaseLayer, setActiveBaseLayer] = useState('vec');
	const [activeOverlayLayers, setActiveOverlayLayers] = useState(['标记']);

	// 定义底图切换函数
	const handleBaseLayerChange = (name) => {
		const map = mapRef.current;
		if (map && layersRef.current.baseLayers && layersRef.current.baseLayersLabel) {
			const baseLayers = layersRef.current.baseLayers;
			const baseLayersLabel = layersRef.current.baseLayersLabel;
			// 移除当前底图
			Object.values(baseLayers).forEach(layer => layer?.removeFrom(map));
			Object.values(baseLayersLabel).forEach(layer => layer?.removeFrom(map));
			// 添加新底图
			if (baseLayers[name]) baseLayers[name].addTo(map);
			if (baseLayersLabel[name]) baseLayersLabel[name].addTo(map);
			setActiveBaseLayer(name);
		}
	};

	const handleOverlayLayerChange = (name) => {
		const map = mapRef.current;
		if (map && layersRef.current.overlayLayers) {
			const overlayLayers = layersRef.current.overlayLayers;
			setActiveOverlayLayers(prev => {
				console.log('prev==>', prev);

				if (prev.includes(name)) {
					if (overlayLayers[name]) overlayLayers[name].addTo(map);
					return prev.filter(layerName => layerName !== name);
				} else {
					if (overlayLayers[name]) overlayLayers[name].removeFrom(map);
					return [...prev, name];
				}
			});
		}
	};

	useEffect(() => {
		if (mapRef.current) return;

		const map = L.map('map', {
			crs: L.supermap.CRS.TianDiTu_Mercator,
			center: [33, 114],
			maxZoom: 18,
			zoom: 4,
		});

		const baseLayers = {
			"vec": new L.supermap.TiandituTileLayer({
				layerType: "vec",
				key: key,
			}),
			"img": new L.supermap.TiandituTileLayer({
				layerType: "img",
				key: key,
			}),
		};
		const baseLayersLabel = {
			"vec": new L.supermap.TiandituTileLayer({
				layerType: "vec",
				isLabel: true,
				key: key,
			}),
			"img": new L.supermap.TiandituTileLayer({
				layerType: "img",
				isLabel: true,
				key: key,
			}),
		};

		baseLayers[activeBaseLayer].addTo(map);
		baseLayersLabel[activeBaseLayer].addTo(map);

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

		let cities = L.layerGroup([BJ, CD]);
		let marks = { "标记": cities }
		layersRef.current = {
			baseLayers,
			baseLayersLabel,
			overlayLayers: activeOverlayLayers.length > 0 ? marks : null
		};

		activeOverlayLayers.forEach(name => {
			if (layersRef.current.overlayLayers[name]) {
				layersRef.current.overlayLayers[name].addTo(map);
			}
		});

		mapRef.current = map;
		L.control.scale().addTo(map);

		return () => {
			map.remove();
			mapRef.current = null;
			// Object.values(layersRef.current.baseLayers).forEach(layer => layer?.remove());
			// Object.values(layersRef.current.baseLayersLabel).forEach(layer => layer?.remove());
			// Object.values(layersRef.current.overlayLayers).forEach(layer => layer?.remove());
		};
	}, [activeBaseLayer]);

	return (
		<div className='flex' style={{ width: "100%", height: "100%" }}>
			<div>
				<div>
					<div className='flex'>坐标:</div>
					<div className='flex'>{popupData?._content}</div>
					<div className='flex'>{coordinate.lat},{coordinate.lng}</div>
				</div>
				<div className='layerControl-box'>
					<LayerControl
						baseLayers={{ "vec": "矢量地图", "img": "影像地图" }}
						overlayLayers={{ "标记": "城市标记" }}
						onBaseLayerChange={handleBaseLayerChange}
						onOverlayLayerChange={handleOverlayLayerChange}
					/>
				</div>
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