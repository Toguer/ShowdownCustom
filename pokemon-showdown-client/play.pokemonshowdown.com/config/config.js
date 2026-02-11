window.Config = window.Config || {};
Config.routes = Config.routes || {};
Config.routes.client = window.location.host;

// Defaults necesarios para que no crashee el topbar al arrancar
Config.customcolors = Config.customcolors || {};
Config.customavatars = Config.customavatars || {};
Config.customgroups = Config.customgroups || null;

// Fuerza WebSocket directo (tu server lo tiene en ws://HOST:8000/showdown/websocket)
Config.socket = { protocol: 'ws', path: '/showdown/websocket' };

const isLocal = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
Config.defaultserver = {
  id: 'anil',
  host: isLocal ? 'localhost' : '37.15.98.131',
  port: 8000,
  httpport: 8000,
  registered: false,
};

Config.afd = false;/*** Begin automatically generated configuration ***/
Config.version = "0.11.2 (38bf75f6)";

Config.routes = {
	root: 'pokemonshowdown.com',
	client: 'localhost:8080',
	dex: 'dex.pokemonshowdown.com',
	replays: 'replay.pokemonshowdown.com',
	users: 'pokemonshowdown.com/users',
	teams: 'teams.pokemonshowdown.com',
};
/*** End automatically generated configuration ***/