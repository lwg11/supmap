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
	// 处理叠加
	Object.entries(overlayLayers).forEach(([name, layer]) => {
		const shouldShow = activeOverlayLayers.includes(name);
		if (shouldShow && layer && layer.addTo) {
			layer.addTo(map);
		} else if (!shouldShow && layer && layer.removeFrom) {
			layer.removeFrom(map);
		}
	});
};

function PopoverPlay({ position, content, coordinates }) {
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

export { LayerControl, PopoverPlay, complexMarkerEventHandler, complexLayerManager };