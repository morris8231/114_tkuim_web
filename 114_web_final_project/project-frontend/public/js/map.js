let map;
let markers = [];
let markerMap = {}; // Store markers by cafe ID for quick access
let selectedMarkerId = null; // Track currently selected marker

// Tag to Chinese label mapping
const tagLabels = {
    work_friendly: '💻 適合工作',
    quiet: '🤫 安靜',
    social: '🗣️ 適合聊天',
    aesthetic: '📸 網美店',
    specialty_coffee: '☕ 精品咖啡',
    dessert: '🍰 甜點',
    pet_friendly: '🐶 寵物友善',
    late_night: '🌙 深夜'
};

// Tag to color mapping for marker icons (saturation -10 for softer look)
const tagColors = {
    work_friendly: '#5691c2',    // Blue (原 #3498db)
    quiet: '#9173a6',            // Purple (原 #9b59b6)
    social: '#d08948',           // Orange (原 #e67e22)
    aesthetic: '#d44a7a',        // Pink (原 #e91e63)
    specialty_coffee: '#7a6055', // Brown (原 #795548)
    dessert: '#ddb948',          // Yellow (原 #f1c40f)
    pet_friendly: '#54c285',     // Green (原 #2ecc71)
    late_night: '#4a5a68',       // Dark gray (原 #34495e)
    default: '#7a6055'           // Default brown
};

// Create icon with specific color
function createCafeIcon(color, isHighlighted = false) {
    const size = isHighlighted ? 30 : 20;
    const borderWidth = isHighlighted ? 4 : 3;
    const shadow = isHighlighted
        ? '0 0 15px rgba(0,0,0,0.6), 0 0 30px ' + color
        : '0 0 5px rgba(0,0,0,0.5)';
    const animation = isHighlighted ? 'pulse 1s ease-in-out infinite' : 'none';

    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="
            background-color: ${color}; 
            border-radius: 50%; 
            width: ${size}px; 
            height: ${size}px; 
            border: ${borderWidth}px solid white; 
            box-shadow: ${shadow};
            animation: ${animation};
            transition: all 0.3s ease;
        "></div>`,
        iconSize: [size + borderWidth * 2, size + borderWidth * 2],
        iconAnchor: [(size + borderWidth * 2) / 2, (size + borderWidth * 2) / 2],
        popupAnchor: [0, -(size / 2 + 5)]
    });
}

// Get color based on cafe's primary tag
function getTagColor(tags) {
    if (!tags || tags.length === 0) return tagColors.default;
    const primaryTag = tags[0];
    return tagColors[primaryTag] || tagColors.default;
}

// Initialize Map
function initMap() {
    // Default location: Taipei
    const taipei = [25.0330, 121.5654];

    // Initialize Leaflet Map
    map = L.map('map', {
        zoomControl: false
    }).setView(taipei, 13);

    // Add Zoom Control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add CartoDB Voyager Tile Layer (Premium look)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Add pulse animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    loadCafesOnMap();
}

async function loadCafesOnMap() {
    try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': 'Bearer ' + token } : {};

        const res = await fetch('http://localhost:8080/api/cafes', { headers });
        if (res.ok) {
            const cafes = await res.json();

            // Clear existing markers if any
            if (markers) {
                markers.forEach(m => map.removeLayer(m));
            }
            markers = [];
            markerMap = {};

            cafes.forEach(addCafeMarker);
        }
    } catch (err) {
        console.error('Failed to load cafes for map', err);
    }
}

function addCafeMarker(cafe) {
    if (!cafe.latitude || !cafe.longitude) return;

    // Get color based on tags
    const color = getTagColor(cafe.tags);
    const icon = createCafeIcon(color);

    // Create Marker with Custom Icon
    const marker = L.marker([cafe.latitude, cafe.longitude], { icon: icon }).addTo(map);

    // Store cafe data on marker for later use
    marker.cafeData = cafe;
    marker.originalColor = color;

    // Bind Popup with Chinese labels
    const tagsHtml = cafe.tags && cafe.tags.length > 0
        ? cafe.tags.map(t => `<span style="font-size: 0.75rem; background: ${tagColors[t] || tagColors.default}; color: white; padding: 2px 8px; border-radius: 12px; margin-right: 4px;">${tagLabels[t] || t}</span>`).join('')
        : '';

    const popupContent = `
        <div style="font-family: 'Noto Sans JP', 'Segoe UI', sans-serif; min-width: 220px;">
            <h3 style="margin: 0 0 8px 0; color: ${color}; border-bottom: 1px solid #e8e8e8; padding-bottom: 8px; font-weight: 500;">${cafe.name}</h3>
            <p style="margin: 0 0 10px 0; color: #666; font-size: 0.85rem; line-height: 1.4;">${cafe.description ? cafe.description.substring(0, 50) + '...' : '暫無描述'}</p>
            <div style="margin-bottom: 10px;">${tagsHtml}</div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.8rem; color: #999;">${cafe.address || 'Taipei'}</span>
                <a href="cafe.html?id=${cafe.id}" style="color: ${color}; font-weight: 500; text-decoration: none; font-size: 0.85rem;">詳情 &rarr;</a>
            </div>
        </div>
    `;

    marker.bindPopup(popupContent);
    markers.push(marker);

    // Store in markerMap for quick access
    markerMap[cafe.id] = marker;
}

// Highlight a specific marker (called when user clicks cafe in sidebar)
function highlightMarker(cafeId) {
    // Reset previous highlighted marker
    if (selectedMarkerId && markerMap[selectedMarkerId]) {
        const prevMarker = markerMap[selectedMarkerId];
        const prevColor = prevMarker.originalColor || tagColors.default;
        prevMarker.setIcon(createCafeIcon(prevColor, false));
    }

    // Highlight new marker
    if (markerMap[cafeId]) {
        const marker = markerMap[cafeId];
        const color = marker.originalColor || tagColors.default;
        marker.setIcon(createCafeIcon(color, true));
        marker.openPopup();
        selectedMarkerId = cafeId;
    }
}

// Make highlightMarker globally accessible
window.highlightMarker = highlightMarker;
window.markerMap = markerMap;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initMap);
