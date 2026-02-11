import {Pokedex as BasePokedex} from "./pokedex-base";

type SpeciesTable = import("../sim/dex-species").SpeciesDataTable;

function toID(s: string) {
	return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}
function typeName(t: string) {
	const m: Record<string, string> = {
		NORMAL: "Normal", FIRE: "Fire", WATER: "Water", GRASS: "Grass", ELECTRIC: "Electric",
		ICE: "Ice", FIGHTING: "Fighting", POISON: "Poison", GROUND: "Ground", FLYING: "Flying",
		PSYCHIC: "Psychic", BUG: "Bug", ROCK: "Rock", GHOST: "Ghost", DRAGON: "Dragon",
		DARK: "Dark", STEEL: "Steel", FAIRY: "Fairy",
	};
	return m[t.toUpperCase()] || (t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
}

import {basePBS} from "./pokemon-pbs";
import {formsPBS} from "./pokemon-forms-pbs";

// Construye pokedex final clonando el base y aplicando parches
export const Pokedex: SpeciesTable = (() => {
	const dex: any = {...BasePokedex};

	// 1) Base species: aplica Types/BaseStats de pokemon.txt
	for (const header of Object.keys(basePBS)) {
		const baseKey = header.split(",")[0].trim(); // [BULBASAUR] etc
		const id = toID(baseKey);
		if (!dex[id]) continue;

		const data = basePBS[header];
		if (data.Types) {
			const ts = data.Types.split(",").map(s => s.trim()).filter(Boolean).map(typeName);
			if (ts.length) dex[id] = {...dex[id], types: ts};
		}
		if (data.BaseStats) {
			const n = data.BaseStats.split(",").map(x => parseInt(x.trim(), 10));
			if (n.length >= 6 && n.every(x => Number.isFinite(x))) {
				const [hp, atk, def, spe, spa, spd] = n;
				dex[id] = {...dex[id], baseStats: {hp, atk, def, spa, spd, spe}};
			}
		}
	}

	// 2) Forms: aplica Types/BaseStats/Abilities/MegaStone (requiredItem) de pokemon_forms.txt
	for (const header of Object.keys(formsPBS)) {
		const baseRaw = header.split(",")[0].trim(); // DRAGONITE, etc
		const baseName = baseRaw.charAt(0) + baseRaw.slice(1).toLowerCase();
		const baseId = toID(baseName);
		const data = formsPBS[header];

		const formName = data.FormName || "";
		const isMega = formName.includes("Mega");
		let formId = "";
		let name = "";
		let forme = "";

		if (isMega) {
			// Mega X / Mega Y / Mega
			const suf = formName.replace(`Mega ${baseName}`, "").trim(); // "", "X", "Y"
			forme = suf ? `Mega-${suf}` : "Mega";
			formId = baseId + "mega" + (suf ? suf.toLowerCase() : "");
			name = `${baseName}-${forme}`;
		} else {
			// otras formas: usa toID del formName
			forme = formName || "Forme";
			formId = baseId + toID(forme);
			name = `${baseName}-${forme}`;
		}

		if (!formId) continue;

		const patch: any = {};
		if (data.Types) {
			const ts = data.Types.split(",").map(s => s.trim()).filter(Boolean).map(typeName);
			if (ts.length) patch.types = ts;
		}
		if (data.BaseStats) {
			const n = data.BaseStats.split(",").map(x => parseInt(x.trim(), 10));
			if (n.length >= 6 && n.every(x => Number.isFinite(x))) {
				const [hp, atk, def, spe, spa, spd] = n;
				patch.baseStats = {hp, atk, def, spa, spd, spe};
			}
		}
		if (data.Abilities) {
			const a = data.Abilities.split(",").map(s => s.trim()).filter(Boolean);
			if (a.length) patch.abilities = {0: a[0].toUpperCase()};
		}
		if (data.MegaStone) {
			// requiredItem usa el token tal cual “Title Case” (coincide con items.txt)
			const tok = data.MegaStone.trim();
			const pretty = tok.endsWith("X") ? tok.slice(0, -1).toLowerCase().replace(/^./, c => c.toUpperCase()) + " X"
				: tok.endsWith("Y") ? tok.slice(0, -1).toLowerCase().replace(/^./, c => c.toUpperCase()) + " Y"
				: tok.toLowerCase().replace(/^./, c => c.toUpperCase());
			patch.requiredItem = pretty;
		}

		// Si existe, lo modifico; si no, lo creo desde la base
		if (dex[formId]) {
			dex[formId] = {...dex[formId], ...patch};
		} else if (dex[baseId]) {
			dex[formId] = {
				...dex[baseId],
				name,
				baseSpecies: baseName,
				forme,
				...patch,
			};
		}
	}

	return dex;
})();
