// wow - 2020

const crypto = require("crypto");

function hash(str, algorithm = "sha1", digest = "hex") {
	return crypto.createHash(algorithm).update(str).digest(digest);
}

module.exports = {
	hash
}