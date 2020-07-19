// wow - 2020

const exec = require('child_process').exec

function isRunning(processName){
	return new Promise(function(resolve){
		let platform = process.platform;
		let cmd = '';
		switch (platform) {
			case 'win32' : cmd = `tasklist`; break;
			case 'linux' : cmd = `ps -A`; break;
			default: break;
		}
		exec(cmd, function(err, stdout) {
			resolve(stdout.toLowerCase().indexOf(processName.toLowerCase()) > -1)
		})
	})
}

module.exports = {
	isRunning
}