export const Items: {[k: string]: ModdedItemData} = {
  jumpluffite: {
    name: "Jumpluffite",
    megaStone: "Jumpluff-Mega",
    megaEvolves: "Jumpluff",
    itemUser: ["Jumpluff"],
    gen: 6,
    desc: "If held by a Jumpluff, this item allows it to Mega Evolve in battle.",
  },
  toxtricityite: {
    name: "Toxtricityite",

    // Para que funcione como megapiedra
    megaStone: "Toxtricity-Mega",   // <- tiene que coincidir EXACTO con el nombre/ID de tu forma mega
    megaEvolves: "Toxtricity",

    // Opcional pero típico en megapiedras
    itemUser: ["Toxtricity"],
    onTakeItem: false,              // evita Knock Off / Trick, etc.
  },

};
