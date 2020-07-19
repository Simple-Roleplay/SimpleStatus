// wow - 2020

const processInfo = require("./src/lib/process.js");
const config = require("./config.json")
const fs = require("fs");

const loadedModules = {};
loadedModules["game"] = require("./src/game.js");

function log() {
	console.log.apply(null, [`[${module.exports.name.toUpperCase()}]`, ...arguments])
}

function init(isSrcdsRunning) {
	if (isSrcdsRunning) {
		console.error("SRCDS is currently running and should be closed");
		process.exit(1);
	}
	log("Starting game server");

	loadedModules.game.init(config, loadedModules);
	loadModules().then();
}

async function loadModules() {
	const modules = fs.readdirSync(config.modulePath);
	for (let i = 0; i < modules.length; ++i) {
		const path = config.modulePath + modules[i];
		const stat = await fs.lstatSync(path);
		if (stat && !stat.isDirectory() || !fs.existsSync(path + "/module.js"))
			return;
		log(`Loading module ${modules[i]}`)
		loadedModules[modules[i]] = require(path + "/module.js");
		loadedModules[modules[i]].init(config, loadedModules);
	}
}

// Start the process
processInfo.isRunning("srcds").then(r => init(r))

module.exports = {
	name: "main"
}


async function cleanUp() {
	if (config.killServerOnQuit && loadedModules.game !== undefined)
		await loadedModules["game"].data.killServer();
	log("Server killed, exiting...")
	process.exit();
}

if (config.killServerOnQuit) {
	process.stdin.resume();
	process.on('exit', cleanUp);
	process.on('SIGINT', cleanUp);
	process.on('SIGUSR1', cleanUp);
	process.on('SIGUSR2', cleanUp);
}