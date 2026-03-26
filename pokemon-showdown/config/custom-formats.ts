export const Formats: import('../sim/dex-formats').FormatList = [{
		section: "EricLostie",
		column: 1
	},

	{
		name: "[Gen 9] RL Doubles",
		mod: "anil",
		gameType: "doubles",
		ruleset: [
			"Standard NatDex",

			// quitar mecánicas
			"Terastal Clause",
			"Dynamax Clause",
			"Z-Move Clause",
			"CFZ Clause",

			// randomlocke: no validar learnsets/abilities
			"!Obtainable Moves",
			"!Obtainable Abilities",
			"!Obtainable Misc",
		],
	},
	{
		section: "Pokemon Añil",
		column: 2,
	},
	{
		name: "[Gen 9] VGC Anything (Bring 6 Pick 4)",
		desc: "Dobles estilo VGC (6->4) pero sin restricciones de legalidad.",
		mod: "gen9",
		gameType: "doubles",

		// Opcional: que aparezca en búsqueda (matchmaking)
		// searchShow: true,

		// Esto define el “VGC feel”:
		ruleset: [
			//"Standard NatDex",
			//"NatDex Mod",


			//Clausulas 
			"Species Clause",
			"Sleep Clause Mod",
			"Evasion Moves Clause",
			"OHKO Clause",
			"Endless Battle Clause",
			"HP Percentage Mod",

			"Team Preview",
			"VGC Timer",
			"Terastal Clause",
			"Z-Move Clause",
			"CFZ Clause",

			// Bring 6 Pick 4:
			"Min Team Size = 6",
			"Max Team Size = 6",
			"Picked Team Size = 4",

			// Nivel tipo VGC (opcional):
			"Adjust Level = 50",

			// Quality-of-life
			"Cancel Mod",

			//Quitar legalidades
			//"!Obtainable Moves",
			//"!Obtainable Abilities",
			//"!Obtainable Misc",

		],

		onChangeSet(set, format, setHas, teamHas) {
			set.evs = {
				hp: 0,
				atk: 0,
				def: 0,
				spa: 0,
				spd: 0,
				spe: 0
			};
			set.ivs = {
				hp: 0,
				atk: 0,
				def: 0,
				spa: 0,
				spd: 0,
				spe: 0
			};
			// NO devuelvas nada
		},

		// MUY importante:
		// NO metas 'Obtainable', 'Flat Rules', 'Standard', 'Standard NatDex', etc.
		// Esas reglas son las que fuerzan legalidad/aprendizajes/bans, etc.
	},

	{
		section: "Pokemon Opalo",
		column: 2
	},

	{
		name: "Opalo VGC Anything (Bring 6 Pick 4)",
		desc: "Pokemon Opalo VGC Anything (Bring 6 Pick 4)",
		mod: "gen9",
		gameType: "doubles",
		ruleset: [
			//"Standard NatDex",
			//"NatDex Mod",


			//Clausulas 
			"Species Clause",
			"Sleep Clause Mod",
			"Evasion Moves Clause",
			"OHKO Clause",
			"Endless Battle Clause",
			"HP Percentage Mod",

			"Team Preview",
			"VGC Timer",
			"Terastal Clause",
			"Z-Move Clause",
			"CFZ Clause",

			// Bring 6 Pick 4:
			"Min Team Size = 6",
			"Max Team Size = 6",
			"Picked Team Size = 4",

			// Nivel tipo VGC (opcional):
			"Adjust Level = 50",

			// Quality-of-life
			"Cancel Mod",

			//Quitar legalidades
			//"!Obtainable Moves",
			//"!Obtainable Abilities",
			//"!Obtainable Misc",

		],
		onChangeSet(set, format, setHas, teamHas) {
			set.evs = {
				hp: 0,
				atk: 0,
				def: 0,
				spa: 0,
				spd: 0,
				spe: 0
			};
			set.ivs = {
				hp: 0,
				atk: 0,
				def: 0,
				spa: 0,
				spd: 0,
				spe: 0
			};
			// NO devuelvas nada
		},

		
	},

	{
		section: "Pokemon Opalo",
		column: 2
	},

	{
		name: "Lvl 22: Opalo VGC Anything (Bring 6 Pick 4)",
		desc: "Pokemon Opalo VGC Anything (Bring 6 Pick 4)",
		mod: "gen9",
		gameType: "doubles",
		ruleset: [
			//"Standard NatDex",
			//"NatDex Mod",


			//Clausulas 
			"Species Clause",
			"Sleep Clause Mod",
			"Evasion Moves Clause",
			"OHKO Clause",
			"Endless Battle Clause",
			"HP Percentage Mod",

			"Team Preview",
			"VGC Timer",
			"Terastal Clause",
			"Z-Move Clause",
			"CFZ Clause",

			// Bring 6 Pick 4:
			"Min Team Size = 6",
			"Max Team Size = 6",
			"Picked Team Size = 4",

			// Nivel tipo VGC (opcional):
			"Adjust Level = 22",

			// Quality-of-life
			"Cancel Mod",

			//Quitar legalidades
			//"!Obtainable Moves",
			//"!Obtainable Abilities",
			//"!Obtainable Misc",

		],
		onChangeSet(set, format, setHas, teamHas) {
			set.evs = {
				hp: 0,
				atk: 0,
				def: 0,
				spa: 0,
				spd: 0,
				spe: 0
			};
			set.ivs = {
				hp: 0,
				atk: 0,
				def: 0,
				spa: 0,
				spd: 0,
				spe: 0
			};
			// NO devuelvas nada
		},

		
	},
	{
		section: "Pokemon Opalo",
		column: 2
	},

	{
		name: "Lvl 32: Opalo VGC Anything (Bring 6 Pick 4)",
		desc: "Pokemon Opalo VGC Anything (Bring 6 Pick 4)",
		mod: "gen9",
		gameType: "doubles",
		ruleset: [
			//"Standard NatDex",
			//"NatDex Mod",


			//Clausulas 
			"Species Clause",
			"Sleep Clause Mod",
			"Evasion Moves Clause",
			"OHKO Clause",
			"Endless Battle Clause",
			"HP Percentage Mod",

			"Team Preview",
			"VGC Timer",
			"Terastal Clause",
			"Z-Move Clause",
			"CFZ Clause",

			// Bring 6 Pick 4:
			"Min Team Size = 6",
			"Max Team Size = 6",
			"Picked Team Size = 4",

			// Nivel tipo VGC (opcional):
			"Adjust Level = 32",

			// Quality-of-life
			"Cancel Mod",

			//Quitar legalidades
			//"!Obtainable Moves",
			//"!Obtainable Abilities",
			//"!Obtainable Misc",

		],
		onChangeSet(set, format, setHas, teamHas) {
			set.evs = {
				hp: 0,
				atk: 0,
				def: 0,
				spa: 0,
				spd: 0,
				spe: 0
			};
			set.ivs = {
				hp: 0,
				atk: 0,
				def: 0,
				spa: 0,
				spd: 0,
				spe: 0
			};
			// NO devuelvas nada
		},

		
	},

	{
		section: "Pokemon Opalo",
		column: 2
	},

	{
		name: "Lvl 45: Opalo VGC Anything (Bring 6 Pick 4)",
		desc: "Pokemon Opalo VGC Anything (Bring 6 Pick 4)",
		mod: "gen9",
		gameType: "doubles",
		ruleset: [
			//"Standard NatDex",
			//"NatDex Mod",


			//Clausulas 
			"Species Clause",
			"Sleep Clause Mod",
			"Evasion Moves Clause",
			"OHKO Clause",
			"Endless Battle Clause",
			"HP Percentage Mod",

			"Team Preview",
			"VGC Timer",
			"Terastal Clause",
			"Z-Move Clause",
			"CFZ Clause",

			// Bring 6 Pick 4:
			"Min Team Size = 6",
			"Max Team Size = 6",
			"Picked Team Size = 4",

			// Nivel tipo VGC (opcional):
			"Adjust Level = 45",

			// Quality-of-life
			"Cancel Mod",

			//Quitar legalidades
			//"!Obtainable Moves",
			//"!Obtainable Abilities",
			//"!Obtainable Misc",

		],
		onChangeSet(set, format, setHas, teamHas) {
			set.evs = {
				hp: 0,
				atk: 0,
				def: 0,
				spa: 0,
				spd: 0,
				spe: 0
			};
			set.ivs = {
				hp: 0,
				atk: 0,
				def: 0,
				spa: 0,
				spd: 0,
				spe: 0
			};
			// NO devuelvas nada
		},

		
	},

	{
		section: "Pokemon Opalo",
		column: 2
	},

	{
		name: "Lvl 57: Opalo VGC Anything (Bring 6 Pick 4)",
		desc: "Pokemon Opalo VGC Anything (Bring 6 Pick 4)",
		mod: "gen9",
		gameType: "doubles",
		ruleset: [
			//"Standard NatDex",
			//"NatDex Mod",


			//Clausulas 
			"Species Clause",
			"Sleep Clause Mod",
			"Evasion Moves Clause",
			"OHKO Clause",
			"Endless Battle Clause",
			"HP Percentage Mod",

			"Team Preview",
			"VGC Timer",
			"Terastal Clause",
			"Z-Move Clause",
			"CFZ Clause",

			// Bring 6 Pick 4:
			"Min Team Size = 6",
			"Max Team Size = 6",
			"Picked Team Size = 4",

			// Nivel tipo VGC (opcional):
			"Adjust Level = 57",

			// Quality-of-life
			"Cancel Mod",

			//Quitar legalidades
			//"!Obtainable Moves",
			//"!Obtainable Abilities",
			//"!Obtainable Misc",

		],
		onChangeSet(set, format, setHas, teamHas) {
			set.evs = {
				hp: 0,
				atk: 0,
				def: 0,
				spa: 0,
				spd: 0,
				spe: 0
			};
			set.ivs = {
				hp: 0,
				atk: 0,
				def: 0,
				spa: 0,
				spd: 0,
				spe: 0
			};
			// NO devuelvas nada
		},

		
	},

	{
		section: "Pokemon Opalo",
		column: 2
	},

	{
		name: "Lvl 72: Opalo VGC Anything (Bring 6 Pick 4)",
		desc: "Pokemon Opalo VGC Anything (Bring 6 Pick 4)",
		mod: "gen9",
		gameType: "doubles",
		ruleset: [
			//"Standard NatDex",
			//"NatDex Mod",


			//Clausulas 
			"Species Clause",
			"Sleep Clause Mod",
			"Evasion Moves Clause",
			"OHKO Clause",
			"Endless Battle Clause",
			"HP Percentage Mod",

			"Team Preview",
			"VGC Timer",
			"Terastal Clause",
			"Z-Move Clause",
			"CFZ Clause",

			// Bring 6 Pick 4:
			"Min Team Size = 6",
			"Max Team Size = 6",
			"Picked Team Size = 4",

			// Nivel tipo VGC (opcional):
			"Adjust Level = 72",

			// Quality-of-life
			"Cancel Mod",

			//Quitar legalidades
			//"!Obtainable Moves",
			//"!Obtainable Abilities",
			//"!Obtainable Misc",

		],
		onChangeSet(set, format, setHas, teamHas) {
			set.evs = {
				hp: 0,
				atk: 0,
				def: 0,
				spa: 0,
				spd: 0,
				spe: 0
			};
			set.ivs = {
				hp: 0,
				atk: 0,
				def: 0,
				spa: 0,
				spd: 0,
				spe: 0
			};
			// NO devuelvas nada
		},

		
	},

	{
		section: "Pokemon Opalo",
		column: 2
	},

	{
		name: "Lvl 79: Opalo VGC Anything (Bring 6 Pick 4)",
		desc: "Pokemon Opalo VGC Anything (Bring 6 Pick 4)",
		mod: "gen9",
		gameType: "doubles",
		ruleset: [
			//"Standard NatDex",
			//"NatDex Mod",


			//Clausulas 
			"Species Clause",
			"Sleep Clause Mod",
			"Evasion Moves Clause",
			"OHKO Clause",
			"Endless Battle Clause",
			"HP Percentage Mod",

			"Team Preview",
			"VGC Timer",
			"Terastal Clause",
			"Z-Move Clause",
			"CFZ Clause",

			// Bring 6 Pick 4:
			"Min Team Size = 6",
			"Max Team Size = 6",
			"Picked Team Size = 4",

			// Nivel tipo VGC (opcional):
			"Adjust Level = 79",

			// Quality-of-life
			"Cancel Mod",

			//Quitar legalidades
			//"!Obtainable Moves",
			//"!Obtainable Abilities",
			//"!Obtainable Misc",

		],
		onChangeSet(set, format, setHas, teamHas) {
			set.evs = {
				hp: 0,
				atk: 0,
				def: 0,
				spa: 0,
				spd: 0,
				spe: 0
			};
			set.ivs = {
				hp: 0,
				atk: 0,
				def: 0,
				spa: 0,
				spd: 0,
				spe: 0
			};
			// NO devuelvas nada
		},

		
	},

	{
		section: "Pokemon Opalo",
		column: 2
	},

	{
		name: "Lvl 88: Opalo VGC Anything (Bring 6 Pick 4)",
		desc: "Pokemon Opalo VGC Anything (Bring 6 Pick 4)",
		mod: "gen9",
		gameType: "doubles",
		ruleset: [
			//"Standard NatDex",
			//"NatDex Mod",


			//Clausulas 
			"Species Clause",
			"Sleep Clause Mod",
			"Evasion Moves Clause",
			"OHKO Clause",
			"Endless Battle Clause",
			"HP Percentage Mod",

			"Team Preview",
			"VGC Timer",
			"Terastal Clause",
			"Z-Move Clause",
			"CFZ Clause",

			// Bring 6 Pick 4:
			"Min Team Size = 6",
			"Max Team Size = 6",
			"Picked Team Size = 4",

			// Nivel tipo VGC (opcional):
			"Adjust Level = 88",

			// Quality-of-life
			"Cancel Mod",

			//Quitar legalidades
			//"!Obtainable Moves",
			//"!Obtainable Abilities",
			//"!Obtainable Misc",

		],
		onChangeSet(set, format, setHas, teamHas) {
			set.evs = {
				hp: 0,
				atk: 0,
				def: 0,
				spa: 0,
				spd: 0,
				spe: 0
			};
			set.ivs = {
				hp: 0,
				atk: 0,
				def: 0,
				spa: 0,
				spd: 0,
				spe: 0
			};
			// NO devuelvas nada
		},

		
	},
	{
		section: "Pokemon Opalo",
		column: 2
	},

	{
		name: "Lvl 94: Opalo VGC Anything (Bring 6 Pick 4)",
		desc: "Pokemon Opalo VGC Anything (Bring 6 Pick 4)",
		mod: "gen9",
		gameType: "doubles",
		ruleset: [
			//"Standard NatDex",
			//"NatDex Mod",


			//Clausulas 
			"Species Clause",
			"Sleep Clause Mod",
			"Evasion Moves Clause",
			"OHKO Clause",
			"Endless Battle Clause",
			"HP Percentage Mod",

			"Team Preview",
			"VGC Timer",
			"Terastal Clause",
			"Z-Move Clause",
			"CFZ Clause",

			// Bring 6 Pick 4:
			"Min Team Size = 6",
			"Max Team Size = 6",
			"Picked Team Size = 4",

			// Nivel tipo VGC (opcional):
			"Adjust Level = 94",

			// Quality-of-life
			"Cancel Mod",

			//Quitar legalidades
			//"!Obtainable Moves",
			//"!Obtainable Abilities",
			//"!Obtainable Misc",

		],
		onChangeSet(set, format, setHas, teamHas) {
			set.evs = {
				hp: 0,
				atk: 0,
				def: 0,
				spa: 0,
				spd: 0,
				spe: 0
			};
			set.ivs = {
				hp: 0,
				atk: 0,
				def: 0,
				spa: 0,
				spd: 0,
				spe: 0
			};
			// NO devuelvas nada
		},

		
	},
];
