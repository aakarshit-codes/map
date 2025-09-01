let mapInstance = null;

/**
 * Initialize the Leaflet map
 * @returns {object} map instance
*/

export function initMap() {
  // initialize map with modest zoom and minimal controls
  mapInstance = L.map('map', {
    center: [20.5937, 78.9629],
    zoom: 3,
    minZoom: 3, // prevent zooming out too far
    zoomControl: false, // we'll add a compact control
    attributionControl: false
  });

  // Minimal light basemap (CartoDB Positron)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    noWrap: true // prevent horizontal wrapping of map tiles
  }).addTo(mapInstance);

  // prevent panning to other world copies — clamp to world bounds
  const worldBounds = [[-90, -180], [90, 180]];
  mapInstance.setMaxBounds(worldBounds);
  mapInstance.options.maxBoundsViscosity = 1.0;

  // Compact custom zoom control (bottom-right)
  // subtle attribution (bottom-left)
  L.control.attribution({ prefix: false, position: 'bottomleft' }).addAttribution('&copy; OpenStreetMap & Carto').addTo(mapInstance);

  // Custom compact controls: zoom in, zoom out, locate
  const MapControls = L.Control.extend({
    options: { position: 'bottomright' },
    onAdd: function (map) {
      const container = L.DomUtil.create('div', 'map-controls');

      const createBtn = (title, svg) => {
        const btn = L.DomUtil.create('button', 'map-btn', container);
        btn.type = 'button';
        btn.title = title;
        btn.innerHTML = svg;
        L.DomEvent.disableClickPropagation(btn);
        return btn;
      };

      const zoomInSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14M5 12h14"/></svg>';
      const zoomOutSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14"/></svg>';
      const locateSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41M7 12a5 5 0 1010 0 5 5 0 00-10 0z"/></svg>';

      const zin = createBtn('Zoom in', zoomInSvg);
      const zout = createBtn('Zoom out', zoomOutSvg);
      const loc = createBtn('Show my location', locateSvg);

      zin.addEventListener('click', () => map.zoomIn());
      zout.addEventListener('click', () => {
        // guard against zooming past minZoom
        if (map.getZoom() > (map.getMinZoom ? map.getMinZoom() : 0)) {
          map.zoomOut();
        }
      });
      loc.addEventListener('click', () => {
        // triggers browser geolocation prompt; map will center on found location
        map.locate({ setView: true, maxZoom: 13 });
      });

      return container;
    }
  });

  mapInstance.addControl(new MapControls());

  // location marker handling
  let _locMarker = null;
  mapInstance.on('locationfound', (e) => {
    if (_locMarker) _locMarker.remove();
    _locMarker = L.circleMarker(e.latlng, {
      radius: 8,
      color: '#059669',
      weight: 1.5,
      fillColor: '#bbf7d0',
      fillOpacity: 0.9
    }).addTo(mapInstance);
  });

  mapInstance.on('locationerror', (err) => {
    // keep silent but log for debugging
    console.warn('Location error:', err.message);
  });

  return mapInstance;
}

/**
 * Get the current Leaflet map instance
*/
export function getMapInstance() {
  return mapInstance;
}