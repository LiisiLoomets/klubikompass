import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const rows = JSON.parse(readFileSync('scripts/places.json', 'utf8'));
console.log(`Read ${rows.length} places`);

for (let i = 0; i < rows.length; i += 500) {
  const { error } = await supabase
    .from('places')
    .upsert(rows.slice(i, i + 500), { onConflict: 'osm_id' });
  if (error) throw error;
  console.log(`Saved ${Math.min(i + 500, rows.length)} / ${rows.length}`);
}

console.log('Done');