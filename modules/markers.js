import { getMapInstance } from "./map.js";

let allLocations = [];
let activeMarkers = [];

/**
 * Load location data from JSON and display markers
*/
export async function loadMarkers() {
  try {
    const response = await fetch('./data/locations.json');
    allLocations = await response.json();
    renderMarkers(allLocations);
  } catch (error) {
    console.error("Error loading markers:", error);
  }
}

/**
 * Render markers on the map from a location list
 * @param {Array} locations 
*/
export function renderMarkers(locations) {
  const map = getMapInstance();

  activeMarkers.forEach(marker => marker.remove());
  activeMarkers = [];

  locations.forEach(location => {
    // use a subtle circle marker for a minimal look
    const circle = L.circleMarker([location.lat, location.lng], {
      radius: 6,
      color: '#2563eb', // blue-600
      weight: 1.5,
      fillColor: '#60a5fa', // blue-400
      fillOpacity: 0.9
    }).addTo(map);

    circle.bindPopup(`
      <div style="max-width:220px; font-family:system-ui, -apple-system, 'Segoe UI', Roboto;">
        <div style="font-weight:600; color:#0f172a; margin-bottom:6px">${location.name}</div>
        <div style="color:#475569; font-size:13px; margin-bottom:8px">${location.description}</div>
        <div style="display:inline-block; background:#eef2ff; color:#3730a3; padding:4px 8px; border-radius:999px; font-size:12px">${location.category}</div>
      </div>
    `, { className: 'modern-popup' });

    activeMarkers.push(circle);
  });
}

/**
 * Get all loaded location data
*/
export function getAllLocations() {
  return allLocations;
}