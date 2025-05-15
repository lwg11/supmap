import React, { useState, useEffect, useRef } from 'react';
import { Popover } from "antd";
import L from 'leaflet';
import './map.css';
import '@supermapgis/iclient-leaflet';
import {
	jj,
	BOUNDARY_LAYER_URL,
	baseLayersData,
	overlayLayersData,
	BASEMAP_URL,
	baseMapData
} from './config';
import { LayerControl, PopoverPlay } from './utils/tools';
import { MAP_CONFIG,SUPERMAP_CONFIG, BASE_LAYERS, BASE_LAYERS_LABEL, HIGHLIGHT_STYLE } from './config/mapConfig';
import { manageLayers } from './utils/layerManager';
import { createMarkers } from './utils/markerManager';


export default function Map() {
	const mapRef = useRef(null);
	const mapContainerRef = useRef(null);
	const layersRef = useRef({});
	const [coordinate, setCoordinates] = useState({ lat: 0, lng: 0 });
	const [popupData, setPopupData] = useState({});
	const [activeMarker, setActiveMarker] = useState({ show: false });
	const [activeBaseLayer, setActiveBaseLayer] = useState('vec');
	const [activeOverlayLayers, setActiveOverlayLayers] = useState([]);
	const [activeBaseMapLayer, setActiveBaseMapLayer] = useState('tianditu');

	const handleBaseMapLayerChange = (name) => {
		const map = mapRef.current;
		if (!map) return;
	
		// 移除当前底图和标注图层
		const baseLayers = layersRef.current.baseLayers;
		const baseLayersLabel = layersRef.current.baseLayersLabel;
		Object.values(baseLayers).forEach(layer => layer?.removeFrom(map));
		Object.values(baseLayersLabel).forEach(layer => layer?.removeFrom(map));

		// 根据选中的底图类型获取对应的配置
		const mapConfig = name === 'tianditu' ? MAP_CONFIG : SUPERMAP_CONFIG;

		// 重新初始化地图
		map.setView(mapConfig.center, mapConfig.zoom);
		map.options.crs = mapConfig.crs;
		map.options.maxZoom = mapConfig.maxZoom;
	
		// 根据选中的底图类型创建新的底图和标注图层
		const createLayer = (config) => {
		  if (config.type === 'TiandituTileLayer') {
			return new L.supermap.TiandituTileLayer(config.options);
		  }
		  // SuperMap 底图有对应的配置和创建方式
		  if (config.type === 'SuperMapTileLayer') {
			return new L.supermap.TiledMapLayer(config.options.url);
		  }
		  return null;
		};
	
		let newBaseLayers = {};
		let newBaseLayersLabel = {};
		if (name === 'tianditu') {
		  newBaseLayers = Object.fromEntries(
			Object.entries(BASE_LAYERS).map(([key, config]) => [key, createLayer(config)])
		  );
		  newBaseLayersLabel = Object.fromEntries(
			Object.entries(BASE_LAYERS_LABEL).map(([key, config]) => [key, createLayer(config)])
		  );
		} else if (name === 'supermap') {
		  // 假设 SuperMap 底图配置
		  const supermapBaseLayers = {
			vec: {
			  type: 'SuperMapTileLayer',
			  options: { url: BASEMAP_URL }
			}
		  };
		  const supermapBaseLayersLabel = {
			vec: {
			  type: 'SuperMapTileLayer',
			  options: { url: BASEMAP_URL }
			}
		  };
		  newBaseLayers = Object.fromEntries(
			Object.entries(supermapBaseLayers).map(([key, config]) => [key, createLayer(config)])
		  );
		  newBaseLayersLabel = Object.fromEntries(
			Object.entries(supermapBaseLayersLabel).map(([key, config]) => [key, createLayer(config)])
		  );
		}
	
		// 更新 layersRef
		layersRef.current.baseLayers = newBaseLayers;
		layersRef.current.baseLayersLabel = newBaseLayersLabel;
	
		// 添加新的底图和标注图层
		manageLayers(map, newBaseLayers, newBaseLayersLabel, activeBaseLayer, layersRef.current.overlayLayers, activeOverlayLayers);
	
		setActiveBaseMapLayer(name);
	  };

	const handleBaseLayerChange = (name) => {
		const map = mapRef.current;
		if (map && layersRef.current.baseLayers && layersRef.current.baseLayersLabel) {
			const baseLayers = layersRef.current.baseLayers;
			const baseLayersLabel = layersRef.current.baseLayersLabel;
			manageLayers(map, baseLayers, baseLayersLabel, name, layersRef.current.overlayLayers, activeOverlayLayers);
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

				console.log('activeBaseLayer', activeBaseLayer);
				console.log('newState', newState);


				manageLayers(
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

        console.log('activeBaseMapLayer====>', activeBaseMapLayer);

        // 根据选中的底图类型获取对应的配置
        const mapConfig = activeBaseMapLayer === 'tianditu' ? MAP_CONFIG : SUPERMAP_CONFIG;

        // 使用动态配置创建地图实例
        const map = L.map(mapContainerRef.current, mapConfig);

        const createLayer = (config) => {
            if (config.type === 'TiandituTileLayer') {
                return new L.supermap.TiandituTileLayer(config.options);
            }
            if (config.type === 'SuperMapTileLayer') {
                return new L.supermap.TiledMapLayer(config.options.url);
            }
            return null;
        };

        let baseLayers = {};
        let baseLayersLabel = {};
        if (activeBaseMapLayer === 'tianditu') {
            baseLayers = Object.fromEntries(
                Object.entries(BASE_LAYERS).map(([key, config]) => [key, createLayer(config)])
            );
            baseLayersLabel = Object.fromEntries(
                Object.entries(BASE_LAYERS_LABEL).map(([key, config]) => [key, createLayer(config)])
            );
        } else if (activeBaseMapLayer === 'supermap') {
			
            const supermapBaseLayers = {
                vec: {
                    type: 'SuperMapTileLayer',
                    options: { url: BASEMAP_URL }
                }
            };
            const supermapBaseLayersLabel = {
                vec: {
                    type: 'SuperMapTileLayer',
                    options: { url: BASEMAP_URL }
                }
            };
            baseLayers = Object.fromEntries(
                Object.entries(supermapBaseLayers).map(([key, config]) => [key, createLayer(config)])
            );
            baseLayersLabel = Object.fromEntries(
                Object.entries(supermapBaseLayersLabel).map(([key, config]) => [key, createLayer(config)])
            );
        }

        const jjLayer = new L.supermap.TiledVectorLayer(jj, {
            cacheEnabled: true,
            returnAttributes: true
        });

        const boundaryLayer = new L.supermap.TiledMapLayer(BOUNDARY_LAYER_URL, {
            transparent: true,
            cacheEnabled: true,
            opacity: 0.8
        });

        let selectId = null;
        let selectLayerName = null;
        const clearHighlight = () => {
            if (selectId && selectLayerName) {
                jjLayer.resetFeatureStyle(selectId, selectLayerName);
            }
            selectId = null;
            selectLayerName = null;
        };

        jjLayer.on('click', (evt) => {
            const id = evt.layer.properties.id;
            const layerName = evt.layer.layerName;
            clearHighlight();
            selectId = id;
            selectLayerName = layerName;
            jjLayer.setFeatureStyle(id, layerName, HIGHLIGHT_STYLE);
        });

        const cities = createMarkers(mapRef, setPopupData, setCoordinates, setActiveMarker);

        const marks = {
            "标记": cities,
            "jj图层": jjLayer,
            "行政区划": boundaryLayer
        };

        layersRef.current = {
            baseLayers,
            baseLayersLabel,
            overlayLayers: marks
        };

        manageLayers(map, baseLayers, baseLayersLabel, activeBaseLayer, marks, activeOverlayLayers);

        mapRef.current = map;
        L.control.scale().addTo(map);

        return () => {
            map.remove();
            mapRef.current = null;
            Object.values(layersRef.current.baseLayers).forEach(layer => layer?.remove());
            Object.values(layersRef.current.baseLayersLabel).forEach(layer => layer?.remove());
            Object.values(layersRef.current.overlayLayers).forEach(layer => layer?.remove());
        };
    }, [activeBaseLayer, activeOverlayLayers, activeBaseMapLayer]);

	return (
		<div className='flex' style={{ width: "100%", height: "100%", justifyContent: 'space-around' }}>
			<div>
				<div>
					<div className='flex'>坐标:</div>
					<div className='flex'>{popupData?._content}</div>
					<div className='flex'>{coordinate.lat},{coordinate.lng}</div>
				</div>
				<div className='layerControl-box'>
					<LayerControl
						baseMapLayers={baseMapData}
						activeBaseMapLayer={activeBaseMapLayer}
						onBaseMapLayerChange={handleBaseMapLayerChange}

						baseLayers={baseLayersData}
						overlayLayers={overlayLayersData}
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