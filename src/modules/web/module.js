// wow - 2020

const express = require("express");
const cookieParser = require("cookie-parser");
const cryptoLib = require.main.require("./src/lib/crypto.js");

let token;
let config;
let modules;

function log() {
	console.log.apply(null, [`[${module.exports.name.toUpperCase()}]`, ...arguments])
}

async function init() {
	const app = express()
	app.use(express.static(module.path + "/webui/"))
	app.use(cookieParser());

	// middleware for blacklist
	app.use(function (req, res, next) {
		let clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		for (let i = 0; i < config.ipBlacklist.length; ++i) {
			if (clientIP.includes(config.ipBlacklist[i])) {
				log('Client blocked:', clientIP, req.originalUrl, Date.now());
				return false;
			}
		}
		log("Web access", clientIP, req.originalUrl, Date.now());
		next();
	});

	app.get("/api/isOnline", function (req, res) {
		if (!modules.game.data.cp)
			return res.send(false);
		res.send(modules.game.data.cp.online);
	})

	app.get("/api/forceRestart", async function (req, res) {
		let clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		if (req.cookies === undefined || req.cookies.token !== token) {
			res.status(500);
			res.send("bad");
			log("Reboot tried without success by", clientIP)
			return;
		}
		await modules.game.data.killServer();
		res.status(200);
		res.send("ok");
		log("Rebooted by", clientIP)
	})

	app.get("/api/checkToken", async function (req, res) {
		setTimeout(function () {
			if (req.cookies === undefined || req.cookies.token !== token) {
				res.status(500);
				res.send("bad");
				return;
			}
			res.status(200);
			res.send("ok");
		}, config.tokenTimeout)
	})


	app.listen(config.port, () => log("Web server is running on port", config.port));
}

function _init(_config, _modules) {
	config = _config;
	modules = _modules;

	token = cryptoLib.hash(config.user + config.pass);
	log(token)
	init().then();
}

module.exports = {
	init: _init,
	version: 1,
	env: global,
	name: "web",
}