import osmium

SRC = 'scripts/estonia-latest.osm.pbf'
TYPES = {'bar', 'pub', 'nightclub'}

points = 0
outlines = 0

processor = osmium.FileProcessor(SRC, osmium.osm.NODE | osmium.osm.WAY).with_filter(
    osmium.filter.KeyFilter('amenity')
)

for obj in processor:
    if obj.tags.get('amenity') not in TYPES:
        continue
    if isinstance(obj, osmium.osm.Node):
        points += 1
    else:
        outlines += 1

print(f'Mapped as points: {points}')
print(f'Mapped as building outlines: {outlines}')