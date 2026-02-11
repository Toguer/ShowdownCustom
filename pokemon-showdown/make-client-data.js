"use strict";

const fs = require("fs");
const path = require("path");

/**
 * CONFIG: ajusta estas 2 rutas si tuvieras el server/cliente en otro sitio.
 */
const SERVER_ROOT = "H:/Games/ShowdownServer/pokemon-showdown";
const CLIENT_DATA_DIR = "H:/Games/ClienteShowdown/pokemon-showdown-client/play.pokemonshowdown.com/data";

/**
 * Helpers
 */
function exists(p) {
  try {
    fs.accessSync(p, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function toID(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

/**
 * Writes a client data file that defines BOTH:
 * - exports.<Name> (CommonJS-like clients)
 * - globalThis.<Name> (browser global)
 */
function writeClientData(outFileName, globalName, dataObj) {
  const outPath = path.resolve(CLIENT_DATA_DIR, outFileName);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  // Important: JSON.stringify will drop functions (fine for client display data).
  const payload = JSON.stringify(dataObj);

  const js =
    "(function(g){\n" +
    "  var d=" + payload + ";\n" +
    "  if (typeof exports !== 'undefined') exports." + globalName + " = d;\n" +
    "  g." + globalName + " = d;\n" +
    "})(typeof globalThis !== 'undefined' ? globalThis : window);\n";

  fs.writeFileSync(outPath, js, "utf8");
  console.log("Wrote", outPath, "(" + globalName + ")");
}

/**
 * LOAD MOVES
 * Prefer server data/moves.json (tú lo tienes).
 */
function loadMoves() {
  const p1 = path.resolve(SERVER_ROOT, "data/moves.json");
  if (exists(p1)) return readJSON(p1);

  // fallback: require data/moves.js
  const p2 = path.resolve(SERVER_ROOT, "data/moves.js");
  if (exists(p2)) {
    const mod = require(p2);
    return mod.BattleMovedex || mod.Moves || mod.BattleMoves || mod.default;
  }

  throw new Error("No encuentro moves en data/moves.json ni data/moves.js");
}

/**
 * LOAD ITEMS
 * Prefer server data/items.js (donde están tus items custom).
 */
function loadItems() {
  const p = path.resolve(SERVER_ROOT, "data/items.js");
  if (!exists(p)) throw new Error("No existe " + p);

  const mod = require(p);
  const items = mod.BattleItems || mod.Items || mod.default;

  if (!items) {
    console.error("data/items.js exports =", Object.keys(mod));
    throw new Error("data/items.js no exporta BattleItems/Items");
  }

  // SAFETY: asegurar Super Eviolite por id
  if (!items.supereviolite) {
    // intenta encontrar por nombre
    const keyByName = Object.keys(items).find(
      k => items[k] && toID(items[k].name) === "supereviolite"
    );

    if (keyByName) {
      items.supereviolite = items[keyByName];
      console.warn("WARN: supereviolite no existía como key; lo he añadido desde:", keyByName);
    } else {
      console.warn("WARN: No encuentro Super Eviolite en items. Revisa tu data/items.js");
    }
  }

  return items;
}

/**
 * LOAD ABILITIES
 * Prefer server data/abilities.js
 */
function loadAbilities() {
  const p = path.resolve(SERVER_ROOT, "data/abilities.js");
  if (!exists(p)) throw new Error("No existe " + p);

  const mod = require(p);
  const abilities = mod.BattleAbilities || mod.Abilities || mod.default;

  if (!abilities) {
    console.error("data/abilities.js exports =", Object.keys(mod));
    throw new Error("data/abilities.js no exporta BattleAbilities/Abilities");
  }

  return abilities;
}

/**
 * OPTIONAL: POKEDEX for client
 * Si quieres, genera BattlePokedex para el cliente también.
 * Si no lo quieres, comenta la llamada en main().
 */
function loadPokedexMaybe() {
  // Primero intenta el JSON compilado, si lo tuvieras.
  const pJson = path.resolve(SERVER_ROOT, "dist/data/pokedex.json");
  if (exists(pJson)) return readJSON(pJson);

  // Luego intenta data/pokedex.js (BattlePokedex / Pokedex)
  const pJs = path.resolve(SERVER_ROOT, "data/pokedex.js");
  if (exists(pJs)) {
    const mod = require(pJs);
    return mod.BattlePokedex || mod.Pokedex || mod.default;
  }

  console.warn("WARN: No genero pokedex (no encuentro dist/data/pokedex.json ni data/pokedex.js)");
  return null;
}

function main() {
  console.log("SERVER_ROOT =", SERVER_ROOT);
  console.log("CLIENT_DATA_DIR =", CLIENT_DATA_DIR);

  const movedex = loadMoves();
  const items = loadItems();
  const abilities = loadAbilities();

  writeClientData("moves.js", "BattleMovedex", movedex);
  writeClientData("items.js", "BattleItems", items);
  writeClientData("abilities.js", "BattleAbilities", abilities);

  // (Opcional) Pokedex
  const pokedex = loadPokedexMaybe();
  if (pokedex) writeClientData("pokedex.js", "BattlePokedex", pokedex);

  console.log("DONE.");
  console.log("Check: items.supereviolite =", !!items.supereviolite);
}

main();
