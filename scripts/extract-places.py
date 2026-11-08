import json
import osmium

SRC = 'scripts/estonia-latest.osm.pbf'
OUT = 'scripts/places.json'
TYPES = {'bar', 'pub', 'nightclub'}


def get_address(tags):
    parts = []
    if tags.get('addr:street'):
        parts.append(tags['addr:street'])
    if tags.get('addr:housenumber'):
        parts.append(tags['addr:housenumber'])
    return ', '.join(parts) if parts else None


rows = []

processor = osmium.FileProcessor(SRC, osmium.osm.NODE).with_filter(
    osmium.filter.KeyFilter('amenity')
)

for node in processor:
    amenity = node.tags.get('amenity')
    if amenity not in TYPES:
        continue

    rows.append({
        'osm_id': node.id,
        'name': node.tags.get('name') or 'Tundmatu koht',
        'type': amenity,
        'latitude': node.location.lat,
        'longitude': node.location.lon,
        'address': get_address(node.tags),
    })

with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(rows, f, ensure_ascii=False)

print(f'Saved {len(rows)} places to {OUT}')