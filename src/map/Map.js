import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
// import '@supermapgis/iclient-leaflet';
import { TiledMapLayer } from '@supermapgis/iclient-leaflet';

export default function Map(props) {
	const mapRef = useRef(null);
	const mapContainerRef = useRef(null); // 新增 ref 用于引用地图容器
	const url = "https://iserver.supermap.io/iserver/services/map-world/rest/maps/World";
	var China = new L.supermap.TiledMapLayer(url + '/iserver/services/map-china400/rest/maps/China', { noWrap: true });
	var ChinaDark = new L.supermap.TiledMapLayer(url + '/iserver/services/map-china400/rest/maps/ChinaDark', { noWrap: true });

	useEffect(() => {
		if (mapRef.current) return; // 防止重复初始化

		const map = L.map('mapbox', {
			crs: L.CRS.EPSG4326,
			center: [0, 0],
			maxZoom: 18,
			zoom: 1,
			layers: [China, ChinaDark]
		});

		const layer = new TiledMapLayer(url);
		layer.addTo(map);

		mapRef.current = map; // 存储地图实例



		var baseMaps = { "China": China, "ChinaDark": ChinaDark };
// 添加图层切换控件
L.control.layers(baseMaps).addTo(map);


		// 清理函数
		return () => {
			if (mapRef.current) {
				mapRef.current.remove();
				mapRef.current = null;
			}
		};
	}, []);

	return (
		<div style={{ width: "100%", height: "100%" }}>
			{/* // 地图显示的div */}
			<div
				ref={mapContainerRef} // 使用 ref 引用地图容器
				id="mapbox"
				style={{ position: "absolute", left: '0px', right: '0px', width: "800px", height: "500px" }}
			></div>
		</div>
	);
};