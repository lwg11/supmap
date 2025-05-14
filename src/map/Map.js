import React, { useState, useEffect, useRef } from 'react';
import { Popover } from "antd";
import L from 'leaflet';
import './map.css';
import '@supermapgis/iclient-leaflet';
import { TiledMapLayer } from '@supermapgis/iclient-leaflet';

// let jj = 'https://iserver.supermap.io/iserver/services/map-Jingjin/restjsr/v1/vectortile/maps/%E4%BA%AC%E6%B4%A5%E5%9C%B0%E5%8C%BA%E5%9C%B0%E5%9B%BE'
let jj = 'https://iserver.supermap.io/iserver/services/map-china400/rest/maps/China'

const LayerControl = ({ baseLayers, overlayLayers, onBaseLayerChange, onOverlayLayerChange, activeBaseLayer }) => {
	return (
		<div style={{ top: '20px', left: '20px', zIndex: 1000, background: 'white', padding: '10px', borderRadius: '5px' }}>
			<h4>底图</h4>
			{Object.entries(baseLayers).map(([name, layer]) => (
				<div key={name}>
					<input
						type="radio"
						id={name}
						name="baseLayer"
						checked={name === activeBaseLayer}
						onChange={() => onBaseLayerChange(name)}
					/>
					<label htmlFor={name}>{layer}</label>
				</div>
			))}
			<h4>图层控制</h4>
			{Object.entries(overlayLayers).map(([name, layer]) => (
				<div key={name} className='text-left'>
					<input
						type="checkbox"
						id={name}
						onChange={() => onOverlayLayerChange(name)}
					/>
					<label htmlFor={name}>{layer}</label>
				</div>
			))}
		</div>
	);
};

const complexMarkerEventHandler = (marker, setPopupData, setCoordinates, setActiveMarker, mapRef, customIcon, highlightIcon) => {
	const handleMarkerClick = (e) => {
		const { latlng } = e;
		setPopupData(e.target._popup);
		setCoordinates(latlng);

		const map = mapRef.current;
		const point = map.latLngToContainerPoint(latlng);

		setActiveMarker(prov => {
			return {
				position: point,
				content: '位置信息',
				coordinates: latlng,
				show: !prov?.show
			};
		});
	};

	const handleMarkerHover = (e) => {
		const { target } = e;
		target.setIcon(highlightIcon);
	};

	const handleMarkerLeave = (e) => {
		e.target.setIcon(customIcon);
	};

	marker
		.on('click', handleMarkerClick)
		.on('mouseover', handleMarkerHover)
		.on('mouseout', handleMarkerLeave);
};

const complexLayerManager = (map, baseLayers, baseLayersLabel, activeBaseLayer, overlayLayers, activeOverlayLayers) => {
	// 辅助移除图层
	const removeLayersFromMap = (layerCollection) => {
		Object.values(layerCollection).forEach(layer => {
			if (layer && layer.removeFrom) {
				layer.removeFrom(map);
			}
		});
	};

	removeLayersFromMap(baseLayers);
	removeLayersFromMap(baseLayersLabel);

	if (baseLayers[activeBaseLayer]) {
		baseLayers[activeBaseLayer].addTo(map);
	}
	if (baseLayersLabel[activeBaseLayer]) {
		baseLayersLabel[activeBaseLayer].addTo(map);
	}

	// 处理叠加层
	Object.entries(overlayLayers).forEach(([name, layer]) => {
		const shouldShow = activeOverlayLayers.includes(name);
		if (shouldShow && layer && layer.addTo) {
			layer.addTo(map);
		} else if (!shouldShow && layer && layer.removeFrom) {
			layer.removeFrom(map);
		}
	});
};

export default function Map() {
	const mapRef = useRef(null);
	const mapContainerRef = useRef(null);
	const layersRef = useRef({});
	const [coordinate, setCoordinates] = useState({ lat: 0, lng: 0 });
	const [popupData, setPopupData] = useState({});
	const [activeMarker, setActiveMarker] = useState({ show: false });
	const key = 'd9ca48dbdb5340a322938f75d26e11fd';

	const [activeBaseLayer, setActiveBaseLayer] = useState('vec');
	const [activeOverlayLayers, setActiveOverlayLayers] = useState([]);

	const handleBaseLayerChange = (name) => {
		const map = mapRef.current;
		if (map && layersRef.current.baseLayers && layersRef.current.baseLayersLabel) {
			const baseLayers = layersRef.current.baseLayers;
			const baseLayersLabel = layersRef.current.baseLayersLabel;
			complexLayerManager(map, baseLayers, baseLayersLabel, name, layersRef.current.overlayLayers, activeOverlayLayers);
			setActiveBaseLayer(name);
		}
	};

	const handleOverlayLayerChange = (name) => {
		const map = mapRef.current;
		if (map && layersRef.current.overlayLayers) {
			const overlayLayers = layersRef.current.overlayLayers;
			setActiveOverlayLayers(prev => {
				const newState = (() => {
					const index = prev.indexOf(name);
					if (index > -1) {
						return [...prev.slice(0, index), ...prev.slice(index + 1)];
					}
					return [...prev, name];
				})();

				// 调用图层管理函数更新图层显示状态
				complexLayerManager(
					map,
					layersRef.current.baseLayers,
					layersRef.current.baseLayersLabel,
					activeBaseLayer,
					overlayLayers,
					newState
				);

				return newState;
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

		// // 创建新图层 TiledVectorLayer
		const jjLayer = new L.supermap.TiledVectorLayer(jj,{
			cacheEnabled: true,
			returnAttributes: true,
		});

		baseLayers[activeBaseLayer].addTo(map);
		baseLayersLabel[activeBaseLayer].addTo(map);

		const customIcon = L.icon({
			iconUrl: require('./img/定位.png'),
			shadowUrl: '/marker-shadow.png',
			iconSize: [35, 40],
		});

		const CD = L.marker([30.40, 104.04]).bindPopup('成都市');

		const highlightIcon = L.icon({
			iconUrl: require('./img/定位2.png'),
			iconSize: [40, 45]
		});

		const BJ = L.marker([39.830660058696104, 116.92866163503169], {
			icon: customIcon
		}).bindPopup('北京市');

		complexMarkerEventHandler(BJ, setPopupData, setCoordinates, setActiveMarker, mapRef, customIcon, highlightIcon);
		complexMarkerEventHandler(CD, setPopupData, setCoordinates, setActiveMarker, mapRef, customIcon, highlightIcon);



		const cities = L.layerGroup([BJ, CD]);
		// const marks = { "标记": cities };

		const marks = { 
			"标记": cities,
			"jj图层": jjLayer // 添加新图层到叠加层
		};

		layersRef.current = {
			baseLayers,
			baseLayersLabel,
			overlayLayers: marks
		};

		complexLayerManager(map, baseLayers, baseLayersLabel, activeBaseLayer, marks, activeOverlayLayers);

		mapRef.current = map;
		L.control.scale().addTo(map);

		return () => {
			map.remove();
			mapRef.current = null;
			Object.values(layersRef.current.baseLayers).forEach(layer => layer?.remove());
			Object.values(layersRef.current.baseLayersLabel).forEach(layer => layer?.remove());
			Object.values(layersRef.current.overlayLayers).forEach(layer => layer?.remove());
		};
	}, [activeBaseLayer, activeOverlayLayers]);

	return (
		<div className='flex' style={{ width: "100%", height: "100%", justifyContent: 'space-around' }}>
			<div>
				<div>
					<div className='flex'>坐标:</div>
					<div className='flex'>{popupData?._content}</div>
					<div className='flex'>{coordinate.lat},{coordinate.lng}</div>
				</div>
				<div className='layerControl-box'>
					{/* <LayerControl
						baseLayers={{ "vec": "矢量地图", "img": "影像地图" }}
						overlayLayers={{ "标记": "城市标记" }}
						onBaseLayerChange={handleBaseLayerChange}
						onOverlayLayerChange={handleOverlayLayerChange}
						activeBaseLayer={activeBaseLayer}
					/> */}
					<LayerControl
						baseLayers={{ "vec": "矢量地图", "img": "影像地图" }}
						overlayLayers={{ "标记": "城市标记", "jj图层": "JJ 图层" }} 
						onBaseLayerChange={handleBaseLayerChange}
						onOverlayLayerChange={handleOverlayLayerChange}
						activeBaseLayer={activeBaseLayer}
					/>
				</div>
			</div>

			<div
				ref={mapContainerRef}
				id="map"
				style={{ width: "75%", height: "800px" }}
			/>
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