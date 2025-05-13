import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import '@supermapgis/iclient-leaflet';
import { TiledMapLayer } from '@supermapgis/iclient-leaflet';

const host = "https://iserver.supermap.io";

export default function Map(props) {
	const mapRef = useRef(null);
	const mapContainerRef = useRef(null);
	const layersRef = useRef({});

	useEffect(() => {
		if (mapRef.current) return;

		const map = L.map('map', {
			crs: L.CRS.EPSG4326,
			// center: [40, 117],
			center: [33, 114],
			maxZoom: 18,
			zoom: 4,
		});

		// 创建基础图层
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
		// 默认添加一个图层
		baseLayers.China.addTo(map);
		// 存储实例
		layersRef.current = baseLayers;
		mapRef.current = map;
		// 添加图层切换控件
		L.control.layers(baseLayers).addTo(map);
		L.control.scale().addTo(map);

		var BJ = L.marker([39.830660058696104, 116.92866163503169]).bindPopup('北京市'),
			CD = L.marker([30.40, 104.04]).bindPopup('成都市');

		var cities = L.layerGroup([BJ, CD]).addTo(map);

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
		<div style={{ width: "100%", height: "100%" }}>
			{/* // 地图显示的div */}
			<div
				ref={mapContainerRef} // 使用 ref 引用地图容器
				id="map"
				style={{ position: "absolute", top: '20px', right: '20px', width: "900px", height: "600px" }}
			></div>
		</div>
	);
};