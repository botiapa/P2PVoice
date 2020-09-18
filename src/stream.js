const pipe = require("it-pipe");
const pushable = require("it-pushable");
const lp = require("it-length-prefixed");
const uint8ArrayToString = require("uint8arrays/to-string");

var textDecoder = new TextDecoder("utf-8");

function pushableStream(stream) {
	// Read utf-8 from stdin
	const source = pushable();
	pipe(
		source,
		//lp.encode(),
		stream.sink
	);
	return source;
}

function readStream(stream, cm, args) {
	pipe(
		stream.source,
		// Decode length-prefixed data
		//lp.decode(),
		async function (source) {
			for await (const msg of source) {
				cm.newMessage(msg.toString(), args);
			}
		}
	);
}

module.exports = {
	pushableStream,
	readStream,
};
