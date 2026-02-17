// custom-pokedex-patch.js
// Incluir en testclient.html ANTES de que cargue el resto del cliente.
// Hace fetch a /api/pokedex (nuestro servidor local) y mergea las entradas
// que no existan en el BattlePokédex oficial del cliente.

(function () {
  'use strict';

  const API_URL = '/api/pokedex';

  // Espera a que window.BattlePokedex exista (puede tardar si lo carga otro script)
  function waitForDex(callback, retries) {
    retries = retries || 0;
    if (typeof window.BattlePokedex !== 'undefined') {
      callback(window.BattlePokedex);
    } else if (retries < 50) {
      setTimeout(() => waitForDex(callback, retries + 1), 100);
    } else {
      console.warn('[CustomDex] BattlePokedex no encontrado tras 5s, patch cancelado.');
    }
  }

  fetch(API_URL)
    .then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(serverDex => {
      const keys = Object.keys(serverDex);
      console.log('[CustomDex] Recibidas', keys.length, 'entradas del servidor.');

      waitForDex(clientDex => {
        let added = 0;
        let updated = 0;

        for (const key of keys) {
          if (!clientDex[key]) {
            // Entrada completamente nueva (Pokémon custom)
            clientDex[key] = serverDex[key];
            added++;
          } else {
            // Entrada existente: solo mergear campos que el servidor tenga distinto
            // Útil para habilidades custom, stats modificados, etc.
            // Si prefieres no tocar los oficiales, comenta este bloque.
            const clientEntry = clientDex[key];
            const serverEntry = serverDex[key];
            let changed = false;

            for (const field of Object.keys(serverEntry)) {
              // Solo sobreescribir si el valor es diferente al oficial
              // Compara por JSON para detectar objetos (abilities, baseStats...)
              if (JSON.stringify(clientEntry[field]) !== JSON.stringify(serverEntry[field])) {
                clientEntry[field] = serverEntry[field];
                changed = true;
              }
            }
            if (changed) updated++;
          }
        }

        console.log('[CustomDex] Patch aplicado:', added, 'nuevos,', updated, 'actualizados.');
      });
    })
    .catch(err => {
      // No bloqueamos el cliente si la API falla — simplemente avisa en consola
      console.warn('[CustomDex] No se pudo cargar el pokedex del servidor:', err.message);
    });
})();
