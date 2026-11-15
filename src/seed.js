import { connectStores, pool } from './db.js';
const products = [
  ['cst-001','Royal Sapphire Dot Mandala Coaster Set (Set of 4)','Coasters',899,'Intricately hand-painted sapphire blue and gold coaster set.','/src/assets/images/coaster_mandala_1786175202823.jpg',20,'Engineered teak wood','Traditional','Best Seller,Handmade,Gift Box Included'],
  ['cst-002','Terracotta Sunburst Mandala Coasters (Set of 4)','Coasters',799,'Warm terracotta base with ivory, copper and maroon sunburst pattern.','https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800',12,'High-density MDF board','Celestial','New Arrival,Earthy Tone'],
  ['key-001','Gilded Lotus Dot Mandala Keychain','Keychains',299,'Hand-painted wooden keychain with ruby red, emerald and gold lotus motif.','/src/assets/images/keychain_mandala_1786175214520.jpg',30,'Birch wood and brass','Floral','Trending Gift'],
  ['mag-001','Maroon & Gold Sacred Geometry Magnet Pair','Fridge Magnets',399,'Hand-painted maroon and gold sacred geometry magnet pair.','/src/assets/images/magnet_mandala_1786175226855.jpg',15,'Wood and acrylic paint','Geometric','Handmade'],
  ['dec-001','Grand Heritage Mandala Decor','Home Decor',1499,'Statement hand-painted mandala decor for a home interior.','/src/assets/images/decor_mandala_1786175238323.jpg',8,'Wood and protective varnish','Traditional','Home Decor']
];
try {
  await connectStores();
  for (const p of products) {
    await pool.execute(`INSERT INTO products (sku,name,category,price,description,image_url,stock_quantity,material,design_style,tags) VALUES (?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name),category=VALUES(category),price=VALUES(price),description=VALUES(description),image_url=VALUES(image_url),material=VALUES(material),design_style=VALUES(design_style),tags=VALUES(tags)`, p);
  }
  console.log(`Seeded ${products.length} sample products. Existing stock quantities were preserved on re-run.`);
} catch (e) { console.error(e); process.exitCode=1; }
finally { await pool.end(); process.exit(); }
