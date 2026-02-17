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
		const data = basePBS[header];

		// SI NO EXISTE EN EL POKEDEX BASE, CRÉALO (Pokémon completamente nuevo)
		if (!dex[id]) {
			const name = data.Name || (baseKey.charAt(0).toUpperCase() + baseKey.slice(1).toLowerCase());
			dex[id] = {
				num: 2000, // Número temporal para customs
				name: name,
				types: ["Normal"], // Tipo por defecto, se sobreescribirá abajo
				baseStats: {hp: 50, atk: 50, def: 50, spa: 50, spd: 50, spe: 50}, // Stats por defecto
				abilities: {0: "No Ability"}, // Habilidad por defecto
			};
		}

		// Aplica parches de Types y BaseStats (tanto para nuevos como existentes)
		// Maneja tanto "Types" (formato pokemon_forms.txt) como "Type1/Type2" (formato pokemon.txt)
		if (data.Types) {
			const types = data.Types.split(",").map(s => s.trim()).filter(Boolean);
			const ts = types.map(typeName);
			if (ts.length) dex[id] = {...dex[id], types: ts};
		} else if (data.Type1 || data.Type2) {
			const types: string[] = [];
			if (data.Type1) types.push(typeName(data.Type1));
			if (data.Type2) types.push(typeName(data.Type2));
			if (types.length) dex[id] = {...dex[id], types: types};
		}
		if (data.BaseStats) {
			const n = data.BaseStats.split(",").map(x => parseInt(x.trim(), 10));
			if (n.length >= 6 && n.every(x => Number.isFinite(x))) {
				const [hp, atk, def, spe, spa, spd] = n;
				dex[id] = {...dex[id], baseStats: {hp, atk, def, spa, spd, spe}};
			}
		}
		// Aplica Abilities si existen en el PBS base
		if (data.Abilities || data.HiddenAbility) {
			const abilitiesObj: any = {};
			
			// Procesar habilidades normales
			if (data.Abilities) {
				const abilities = data.Abilities.split(",").map(s => s.trim()).filter(Boolean);
				abilities.forEach((ability, index) => {
					const abilityName = ability.charAt(0).toUpperCase() + ability.slice(1).toLowerCase();
					abilitiesObj[index.toString()] = abilityName;
				});
			}
			
			// Procesar habilidad oculta (Hidden Ability = slot "H")
			if (data.HiddenAbility) {
				const hiddenAbility = data.HiddenAbility.trim();
				const abilityName = hiddenAbility.charAt(0).toUpperCase() + hiddenAbility.slice(1).toLowerCase();
				abilitiesObj["H"] = abilityName;
			}
			
			if (Object.keys(abilitiesObj).length > 0) {
				dex[id] = {...dex[id], abilities: abilitiesObj};
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
			if (a.length) {
				const abilityName = a[0].charAt(0).toUpperCase() + a[0].slice(1).toLowerCase();
				patch.abilities = {0: abilityName};
			}
		}
		if (data.MegaStone) {
			// requiredItem usa el token tal cual "Title Case" (coincide con items.txt)
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