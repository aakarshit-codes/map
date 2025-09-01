import { getAllLocations, renderMarkers } from './markers.js';
import { getMapInstance } from './map.js';
import { debounce } from './utils.js';

/**
 * Initialize search and category filter events
*/
export function initSearch() {
  const input = document.getElementById('searchInput');
  const select = document.getElementById('categorySelect');

  // --- wire custom dropdown (moved from inline script in index.html) ---
  const btn = document.getElementById('categoryBtn');
  const menu = document.getElementById('categoryMenu');
  const label = document.getElementById('categoryLabel');

  if (btn && menu && select && label) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('hidden');
    });

    menu.addEventListener('click', (e) => {
      const item = e.target.closest('li[data-value]');
      if (!item) return;
      const value = item.getAttribute('data-value');
      const text = item.textContent.trim();
      label.textContent = text;
      select.value = value;
      // dispatch change so existing listeners run
      select.dispatchEvent(new Event('change', { bubbles: true }));
      menu.classList.add('hidden');
    });

    document.addEventListener('click', () => menu.classList.add('hidden'));
  }
  // --- end dropdown wiring ---

  const updateResults = () => {
    const nameQuery = input.value.trim().toLowerCase();
    const category = select.value;

    const filtered = getAllLocations().filter(loc => {
      const matchesName = loc.name.toLowerCase().includes(nameQuery);
      const matchesCategory = category ? loc.category.toLowerCase() === category.toLowerCase() : true;
      return matchesName && matchesCategory;
    });

    renderMarkers(filtered);

    // adjust map view to match the filtered results
    try {
      const map = getMapInstance();
      if (!map) return;

      if (filtered.length === 0) {
        // no results: do nothing (or optionally reset view)
        return;
      }

      if (filtered.length === 1) {
        const loc = filtered[0];
        if (typeof loc.lat === 'number' && typeof loc.lng === 'number') {
          map.setView([loc.lat, loc.lng], 13, { animate: true });
        }
        return;
      }

      // multiple results: fit bounds with padding and limit max zoom
      const latlngs = filtered.map(l => [l.lat, l.lng]);
      const bounds = L.latLngBounds(latlngs);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13, animate: true });
    } catch (err) {
      // ignore errors (e.g., L not available yet)
      // console.warn('Could not adjust map view:', err);
    }
  };

  input.addEventListener('input', debounce(updateResults, 300));
  select.addEventListener('change', updateResults);
}