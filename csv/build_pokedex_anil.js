const fs = require('fs');

const BASE_POKEDEX = 'pokedex.js';
const POKEMON_TXT = 'pokemon.txt';
const FORMS_TXT = 'pokemon_forms.txt';
const OUT_FILE = 'pokedex_anil_full.js';
const CHANGELOG_FILE = 'changelog_anil.txt';

function toId(text) {
  return (text || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

const TYPE_TITLE = {
  NORMAL: 'Normal', FIRE: 'Fire', WATER: 'Water', GRASS: 'Grass', ELECTRIC: 'Electric',
  ICE: 'Ice', FIGHTING: 'Fighting', POISON: 'Poison', GROUND: 'Ground', FLYING: 'Flying',
  PSYCHIC: 'Psychic', BUG: 'Bug', ROCK: 'Rock', GHOST: 'Ghost', DRAGON: 'Dragon',
  DARK: 'Dark', STEEL: 'Steel', FAIRY: 'Fairy',
};

function parseIniSections(text) {
  const lines = text.split(/\r?\n/);
  const sections = [];
  let cur = null;

  for (let rawLine of lines) {
    let line = rawLine.replace(/^\uFEFF/, '').trim();
    if (!line || line.startsWith('#')) continue;

    const m = line.match(/^\[([^\]]+)\]$/);
    if (m) {
      if (cur) sections.push(cur);
      cur = { header: m[1].trim(), raw: {} };
      continue;
    }

    if (!cur) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim();
    cur.raw[key] = val;
  }

  if (cur) sections.push(cur);
  return sections;
}

function parseTypes(v) {
  const toks = (v || '').split(',').map(x => x.trim().toUpperCase()).filter(Boolean);
  return toks.map(t => TYPE_TITLE[t] || (t ? t[0] + t.slice(1).toLowerCase() : t));
}

// Orden PBS (Essentials) que usan tus txt:
// HP, Attack, Defense, Speed, Sp. Atk, Sp. Def
function parseBaseStats(v) {
  const nums = (v || '').split(',').map(x => parseInt(x.trim(), 10)).filter(n => Number.isFinite(n));
  if (nums.length !== 6) return null;
  const [hp, atk, def, spe, spa, spd] = nums;
  return { hp, atk, def, spa, spd, spe };
}

function jsEscapeString(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function jsSerialize(obj) {
  if (obj === null || obj === undefined) return 'null';
  if (obj === true) return 'true';
  if (obj === false) return 'false';
  if (typeof obj === 'number') return Number.isFinite(obj) ? String(obj) : 'null';
  if (typeof obj === 'string') return `"${jsEscapeString(obj)}"`;
  if (Array.isArray(obj)) return `[${obj.map(jsSerialize).join(',')}]`;
  if (typeof obj === 'object') {
    const parts = [];
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      const kk = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? k : `"${jsEscapeString(k)}"`;
      parts.push(`${kk}:${jsSerialize(v)}`);
    }
    return `{${parts.join(',')}}`;
  }
  return `"${jsEscapeString(String(obj))}"`;
}

function serializeJS(pokedexObj) {
  return `exports.BattlePokedex = ${jsSerialize(pokedexObj)};\n`;
}

function keyFromForm(baseId, formName, region, megaStone) {
  if (region) return baseId + toId(region);

  const fn = (formName || '').trim().toLowerCase();

  if (fn.includes('mega')) {
    if (/\bmega\b.*\bx\b/.test(fn)) return baseId + 'megax';
    if (/\bmega\b.*\by\b/.test(fn)) return baseId + 'megay';
    if (/\bmega\b.*\bz\b/.test(fn)) return baseId + 'megaz';
    return baseId + 'mega';
  }

  if (fn.includes('totem')) return baseId + 'alolatotem';

  const suffix = toId(formName);
  if (suffix && !suffix.startsWith(baseId)) return baseId + suffix;
  return suffix || baseId;
}

function makeRequiredItem(baseSpeciesName, megaStone) {
  const ms = toId(megaStone);
  if (ms.endsWith('x')) return `${baseSpeciesName}ite X`;
  if (ms.endsWith('y')) return `${baseSpeciesName}ite Y`;
  if (ms.endsWith('z')) return `${baseSpeciesName}ite Z`;
  return `${baseSpeciesName}ite`;
}

function showdownMegaName(baseSpeciesName, formName) {
  // "Mega Venusaur X" => "Venusaur-Mega-X"
  const fn = (formName || '').trim();
  const lower = fn.toLowerCase();
  if (!lower.startsWith('mega ')) return `${baseSpeciesName}-${fn}`;

  let rest = fn.slice(5).trim(); // quita "Mega "
  // si repite nombre de especie, lo quita
  rest = rest.replace(new RegExp(baseSpeciesName, 'i'), '').trim();
  if (!rest) return `${baseSpeciesName}-Mega`;
  if (rest.length === 1) return `${baseSpeciesName}-Mega-${rest.toUpperCase()}`;
  return `${baseSpeciesName}-Mega-${rest[0].toUpperCase()}${rest.slice(1).toLowerCase()}`;
}

function inferFormeText(formName, region, megaStone) {
  if (region) return region[0].toUpperCase() + region.slice(1).toLowerCase();
  const fn = (formName || '').trim();
  if (/^mega /i.test(fn)) {
    const base = fn.slice(5).trim();
    const last = base.split(/\s+/).pop();
    if (last && last.length === 1) return `Mega-${last.toUpperCase()}`;
    return 'Mega';
  }
  return fn || '';
}

// ---------- Load base pokedex ----------
const baseModule = require(require('path').resolve(process.cwd(), BASE_POKEDEX));
const pokedex = baseModule.BattlePokedex;

// ---------- Apply pokemon.txt (base species) ----------
const pokemonText = fs.readFileSync(POKEMON_TXT, 'utf8');
const pokemonSections = parseIniSections(pokemonText);

const changelog = {
  baseChanged: [],
  baseTypeChanged: [],
  formsModified: [],
  formsAdded: [],
};

for (const sec of pokemonSections) {
  // pokemon.txt headers son [BULBASAUR], [MRMIME], etc.
  const header = sec.header;
  if (header.includes(',')) continue; // no es especie base
  const id = toId(header);
  if (!id || !pokedex[id]) continue;

  const entry = pokedex[id];

  const oldTypes = entry.types ? [...entry.types] : null;
  const oldStats = entry.baseStats ? { ...entry.baseStats } : null;

  let didAnything = false;

  if (sec.raw.Types) {
    const newTypes = parseTypes(sec.raw.Types);
    if (oldTypes && oldTypes.join('/') !== newTypes.join('/')) {
      changelog.baseTypeChanged.push({ id, from: oldTypes.join('/'), to: newTypes.join('/') });
    }
    entry.types = newTypes;
    didAnything = true;
  }

  if (sec.raw.BaseStats) {
    const st = parseBaseStats(sec.raw.BaseStats);
    if (st) {
      entry.baseStats = st;
      didAnything = true;
    }
  }

  if (didAnything) {
    const newTypes = entry.types ? [...entry.types] : null;
    const newStats = entry.baseStats ? { ...entry.baseStats } : null;
    const tChanged = oldTypes && newTypes && oldTypes.join('/') !== newTypes.join('/');
    const sChanged = oldStats && newStats && JSON.stringify(oldStats) !== JSON.stringify(newStats);
    if (tChanged || sChanged) changelog.baseChanged.push(id);
  }
}

// ---------- Apply pokemon_forms.txt (forms) ----------
const formsText = fs.readFileSync(FORMS_TXT, 'utf8');
const formSections = parseIniSections(formsText);

// Índices para mapear mejor
const byRequiredItem = new Map(); // toId(requiredItem) => [key]
const byBaseAndForme = new Map(); // `${toId(baseSpecies)}|${toId(forme)}` => [key]

for (const key of Object.keys(pokedex)) {
  const e = pokedex[key];
  if (e.requiredItem) {
    const rid = toId(e.requiredItem);
    if (!byRequiredItem.has(rid)) byRequiredItem.set(rid, []);
    byRequiredItem.get(rid).push(key);
  }
  if (e.baseSpecies && e.forme) {
    const k = `${toId(e.baseSpecies)}|${toId(e.forme)}`;
    if (!byBaseAndForme.has(k)) byBaseAndForme.set(k, []);
    byBaseAndForme.get(k).push(key);
  }
}

for (const sec of formSections) {
  // headers tipo [VENUSAUR,1]
  const m = sec.header.match(/^([^,]+),\s*(\d+)$/);
  if (!m) continue;

  const speciesRaw = m[1].trim();
  const baseId = toId(speciesRaw);
  if (!baseId) continue;

  const hasTypes = !!sec.raw.Types;
  const hasStats = !!sec.raw.BaseStats;
  if (!hasTypes && !hasStats) continue;

  const formName = (sec.raw.FormName || '').trim();
  const region = (sec.raw.Region || '').trim();
  const megaStone = (sec.raw.MegaStone || '').trim();

  let matchedKey = null;

  // 1) Si es mega: intenta por requiredItem/megaStone
  if (megaStone) {
    const keys = byRequiredItem.get(toId(megaStone));
    if (keys && keys.length) matchedKey = keys[0];
  }

  // 2) Si es regional: intenta por baseSpecies+forme
  if (!matchedKey && region) {
    const keys = byBaseAndForme.get(`${baseId}|${toId(region)}`);
    if (keys && keys.length) matchedKey = keys[0];
  }

  // 3) Si existe exactamente el id calculado
  if (!matchedKey) {
    const candidate = keyFromForm(baseId, formName, region, megaStone);
    if (pokedex[candidate]) matchedKey = candidate;
  }

  // 4) Si no existe, CREAR forma nueva clonando la base
  let created = false;
  if (!matchedKey) {
    if (!pokedex[baseId]) {
      // No hay especie base en pokedex: no podemos clonar
      continue;
    }

    matchedKey = keyFromForm(baseId, formName, region, megaStone);
    const baseEntry = pokedex[baseId];

    const newEntry = JSON.parse(JSON.stringify(baseEntry));
    const baseSpeciesName = baseEntry.name || speciesRaw[0].toUpperCase() + speciesRaw.slice(1).toLowerCase();

    newEntry.baseSpecies = baseSpeciesName;
    newEntry.forme = inferFormeText(formName, region, megaStone);

    if (region) {
      const reg = region[0].toUpperCase() + region.slice(1).toLowerCase();
      newEntry.name = `${baseSpeciesName}-${reg}`;
      newEntry.forme = reg;
    } else if (/^mega /i.test(formName)) {
      newEntry.name = showdownMegaName(baseSpeciesName, formName);
    } else if (formName) {
      newEntry.name = `${baseSpeciesName}-${formName}`;
    } else {
      newEntry.name = `${baseSpeciesName}-${newEntry.forme || 'Form'}`;
    }

    // MegaStone => requiredItem
    if (megaStone) {
      newEntry.requiredItem = makeRequiredItem(baseSpeciesName, megaStone);
    }

    // Habilidades (si vienen)
    if (sec.raw.Abilities) {
      // toma la primera como ability 0
      const first = sec.raw.Abilities.split(',').map(x => x.trim()).filter(Boolean)[0];
      if (first) newEntry.abilities = { "0": first[0].toUpperCase() + first.slice(1).toLowerCase() };
    }

    pokedex[matchedKey] = newEntry;
    created = true;
    changelog.formsAdded.push(matchedKey);
  }

  const entry = pokedex[matchedKey];
  const oldTypes = entry.types ? [...entry.types] : null;
  const oldStats = entry.baseStats ? { ...entry.baseStats } : null;

  if (hasTypes) entry.types = parseTypes(sec.raw.Types);
  if (hasStats) {
    const st = parseBaseStats(sec.raw.BaseStats);
    if (st) entry.baseStats = st;
  }

  if (!created) {
    const newTypes = entry.types ? [...entry.types] : null;
    const newStats = entry.baseStats ? { ...entry.baseStats } : null;
    const tChanged = oldTypes && newTypes && oldTypes.join('/') !== newTypes.join('/');
    const sChanged = oldStats && newStats && JSON.stringify(oldStats) !== JSON.stringify(newStats);
    if (tChanged || sChanged) {
      changelog.formsModified.push({
        id: matchedKey,
        name: entry.name || matchedKey,
        typeChange: tChanged ? `${oldTypes.join('/')} -> ${newTypes.join('/')}` : '',
        statsChanged: sChanged,
      });
    }
  }
}

// ---- Write outputs ----
fs.writeFileSync(OUT_FILE, serializeJS(pokedex), 'utf8');

// changelog text
let out = '';
out += `Base species changed from pokemon.txt: ${changelog.baseChanged.length}\n`;
out += `Base species with TYPE change: ${changelog.baseTypeChanged.length}\n`;
out += `Forms modified (existing): ${changelog.formsModified.length}\n`;
out += `Forms added (new): ${changelog.formsAdded.length}\n\n`;
out += 'Base type changes (id: old -> new):\n';
for (const t of changelog.baseTypeChanged.sort((a,b)=>a.id.localeCompare(b.id))) {
  out += `${t.id}: ${t.from} -> ${t.to}\n`;
}
out += '\nForms modified (existing):\n';
for (const f of changelog.formsModified.sort((a,b)=>a.id.localeCompare(b.id))) {
  out += `${f.id} (${f.name})`;
  if (f.typeChange) out += ` Types: ${f.typeChange}`;
  if (f.statsChanged) out += `${f.typeChange ? ',' : ''} Stats: changed`;
  out += '\n';
}
out += '\nForms added (ids):\n';
out += changelog.formsAdded.sort().join('\n') + '\n';

fs.writeFileSync(CHANGELOG_FILE, out, 'utf8');

console.log('Wrote', OUT_FILE);
console.log('Wrote', CHANGELOG_FILE);
