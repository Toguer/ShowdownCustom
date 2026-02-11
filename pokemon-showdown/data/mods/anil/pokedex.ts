export const Pokedex: import('../../../sim/dex-species').ModdedSpeciesDataTable = {
  jumpluff: {
    inherit: true,
    otherFormes: ['Jumpluff-Mega'],
  },

  jumpluffmega: {
    num: 189,
    name: "Jumpluff-Mega",
    baseSpecies: "Jumpluff",
    forme: "Mega",
    types: ["Grass", "Flying"],
    baseStats: {hp: 75, atk: 55, def: 70, spa: 55, spd: 95, spe: 110}, // <-- aquí tus stats
    abilities: {0: "Aerilate"},
    heightm: 0.8,
    weighthg: 30,
    color: "Blue",
    requiredItem: "Jumpluffite",
    battleOnly: "Jumpluff",
    gen: 6,
  },
};
