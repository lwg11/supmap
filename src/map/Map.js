import React, { useState, useEffect, useRef } from 'react';
import { Popover } from "antd";
import L from 'leaflet';
import './map.css';
import '@supermapgis/iclient-leaflet';
import { jj, BOUNDARY_LAYER_URL } from './config';
import { LayerControl } from './utils/tools';
import { MAP_CONFIG, BASE_LAYERS, BASE_LAYERS_LABEL, HIGHLIGHT_STYLE } from './config/mapConfig';
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

    const map = L.map('map', MAP_CONFIG);

    const createLayer = (config) => {
      if (config.type === 'TiandituTileLayer') {
        return new L.supermap.TiandituTileLayer(config.options);
      }
      return null;
    };

    const baseLayers = Object.fromEntries(
      Object.entries(BASE_LAYERS).map(([key, config]) => [key, createLayer(config)])
    );
    const baseLayersLabel = Object.fromEntries(
      Object.entries(BASE_LAYERS_LABEL).map(([key, config]) => [key, createLayer(config)])
    );

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
          <LayerControl
            baseLayers={{ "vec": "矢量地图", "img": "影像地图" }}
            overlayLayers={{ "标记": "城市标记", "jj图层": "JJ 图层", "行政区划": "省级边界" }}
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