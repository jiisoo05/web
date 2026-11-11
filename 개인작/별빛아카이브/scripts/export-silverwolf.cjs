// Node.js 16+; run from project root: npm install starrail.js@latest && node scripts/export-silverwolf.cjs
const fs = require('node:fs');
const path = require('node:path');
const { StarRail } = require('starrail.js');
const client = new StarRail();
const all = client.getAllCharacters();
function nameOf(c, lang) { try { return c.name?.get?.(lang) || ''; } catch { return ''; } }
const target = all.find(c => [nameOf(c,'en'),nameOf(c,'ko'),nameOf(c,'jp')].some(n => /silver wolf.*lv\.?\s*999|은랑.*999/i.test(n)));
const output = target ? {
  found: true,
  name: nameOf(target,'ko') || nameOf(target,'en'),
  id: String(target.id ?? target.characterId ?? ''),
  // API object shapes vary by release; export only values we can safely identify.
  element: String(target.element?.name?.get?.('ko') ?? target.element?.name ?? ''),
  path: String(target.path?.name?.get?.('ko') ?? target.path?.name ?? ''),
  rarity: String(target.rarity ?? '')
} : {found:false, note:'No exact Silver Wolf LV.999 match in this StarRail.js cache.', checked:all.length};
const out = path.join(__dirname,'..','data','starrail-silverwolf-lv999.json');
fs.writeFileSync(out,JSON.stringify(output,null,2)+'\n','utf8');
console.log(`Checked ${all.length} characters; exact match: ${Boolean(target)}; wrote ${out}`);
