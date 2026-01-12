const https = require('https');
const http = require('http');

// Configuration
const API_BASE = 'http://localhost:8080/api';
const ADMIN_EMAIL = 'admin@coffee.map';
const ADMIN_PASSWORD = 'password123';

// Helper for making HTTP requests
function request(url, options, data = null) {
    return new Promise((resolve, reject) => {
        const lib = url.startsWith('https') ? https : http;
        const req = lib.request(url, options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(body || '{}'));
                    } catch (e) {
                        resolve(body);
                    }
                } else {
                    reject({ status: res.statusCode, body });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function main() {
    console.log('☕ Starting Cafe Import...');

    // 1. Authenticate (Register then Login)
    let token;
    try {
        console.log('🔑 Registering/Logging in...');
        try {
            await request(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }, { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
        } catch (e) {
            // Ignore conflict if already exists
            if (e.status !== 409) console.log('Registration skipped or failed:', e.status);
        }

        const loginRes = await request(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

        token = loginRes.token;
        console.log('✅ Authenticated!');

    } catch (err) {
        console.error('❌ Authentication failed:', err);
        process.exit(1);
    }

    // 2. Fetch Data from Overpass
    console.log('🌍 Fetching data from OpenStreetMap (Taipei)...');
    const overpassQuery = `
        [out:json][timeout:25];
        (
          node["amenity"="cafe"](25.00,121.45,25.10,121.60);
          way["amenity"="cafe"](25.00,121.45,25.10,121.60);
        );
        out body;
        >;
        out skel qt;
    `;

    // Using standard fetch if available (Node 18+), else fallback would be needed but let's try fetch first
    // Actually the helper above is robust enough.

    // We need to encode the query for Overpass
    // Overpass API doesn't like JSON body for query usually, it wants query param or text body.
    // Let's use https.request directly for Overpass to be safe.

    let osmData;
    try {
        const queryEncoded = encodeURIComponent(overpassQuery);
        // Using main public instance
        const url = `https://overpass-api.de/api/interpreter?data=${queryEncoded}`;

        osmData = await new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let data = '';
                res.on('data', c => data += c);
                res.on('end', () => resolve(JSON.parse(data)));
                res.on('error', reject);
            });
        });

        console.log(`📦 Received ${osmData.elements.length} elements from OSM.`);
    } catch (e) {
        console.error('❌ Failed to fetch from OSM:', e);
        process.exit(1);
    }

    // 3. Process and Upload
    const nodes = osmData.elements.filter(e => e.type === 'node' && e.tags && e.tags.name);
    let successCount = 0;

    console.log(`🔄 Processing ${nodes.length} potential cafes...`);

    for (const node of nodes) {
        if (!node.tags.name) continue;

        const cafe = {
            name: node.tags.name,
            description: node.tags.description || node.tags['name:en'] || 'Experience the vibe of this local spot.',
            address: node.tags['addr:street'] ? `${node.tags['addr:street']} ${node.tags['addr:housenumber'] || ''}` : 'Taipei City',
            latitude: node.lat,
            longitude: node.lon,
            tags: generateTags(node.tags)
        };

        try {
            await request(`${API_BASE}/cafes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }, cafe);
            process.stdout.write('.');
            successCount++;
        } catch (e) {
            // console.error(`Failed to import ${cafe.name}:`, e.status);
            process.stdout.write('x');
        }
    }

    console.log(`\n\n🎉 Import completed! Successfully imported ${successCount} cafes.`);
}

function generateTags(osmTags) {
    const tags = new Set();
    const name = osmTags.name || '';

    // Keywords for tags
    if (name.includes('Starbucks') || name.includes('Louisa') || name.includes('Cama')) {
        tags.add('work_friendly');
        tags.add('quiet');
    }

    if (osmTags.internet_access === 'wlan' || osmTags.internet_access === 'yes') {
        tags.add('work_friendly');
    }

    if (osmTags.cuisine === 'cake' || osmTags.pastry) {
        tags.add('dessert');
    }

    if (name.includes('Cat') || name.includes('Dog') || name.includes('Pet')) {
        tags.add('pet_friendly');
    }

    // Heuristic for "Aesthetic" - if it has instagram or website link? 
    if (osmTags.website || osmTags.contact) {
        tags.add('aesthetic');
    }

    // Heuristic for Specialty
    if (name.includes('Roast') || name.includes('Specialty') || name.includes('Lab')) {
        tags.add('specialty_coffee');
    }

    // Default if empty
    if (tags.size === 0) {
        tags.add('social');
    }

    return Array.from(tags);
}

main();
