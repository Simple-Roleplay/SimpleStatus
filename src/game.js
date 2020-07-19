// wow - 2020

const processInfo = require.main.require("./src/lib/process");
const fkill = require('fkill');
const {spawn} = require('child_process');
let config;
let _G;
let env = {}


function log() {
	console.log.apply(null, [`[${module.exports.name.toUpperCase()}]`, ...arguments])
}

async function init() {
	watchdog().then();
	log("Watchdog started")
}

function isServerRunning() {
	if (!processInfo.isRunning(config.processName))
		return false;

	// IDE optimisations black magic
	return !(typeof env.cp === "undefined" || env.cp.online === false);
}

async function watchdog() {
	env.interval = setInterval(function () {
		if (isServerRunning())
			return;
		log("Server crashed ! Restarting now", new Date());
		env.cp = startServer();

	}, config.time)
}

function startServer(callback = () => null) {
	if (isServerRunning())
		return false;

	let cp = spawn(`"${config.gamePath}" -console ${config.arguments}`, [], {shell: true});
	cp.on("close", function () {
		cp.online = false;
		callback(arguments)
	})
	cp.online = true;
	return cp
}

env.killServer = async function () {
	await fkill(config.processName, {force: true, ignoreCase: true, silent: true});
	env.cp.online = false;
}

function _init(_config, __G) {
	config = _config;
	_G = __G;

	init().then();
}

module.exports = {
	init: _init,
	version: 1,
	env: global,
	name: "game",
	data: env
}