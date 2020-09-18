const pipe = require("it-pipe");
const pushable = require("it-pushable");
const lp = require("it-length-prefixed");
const uint8ArrayToString = require("uint8arrays/to-string");

var textDecoder = new TextDecoder("utf-8");

export const MSG_TYPE = {
	SETTINGS: 0,
	MESSAGE: 1,
};

export function pushableStream(stream) {
	// Read utf-8 from stdin
	const source = pushable();
	pipe(
		source,
		//lp.encode(),
		stream.sink
	);
	return source;
}

export function readStream(stream, cm, args) {
	pipe(
		stream.source,
		// Decode length-prefixed data
		//lp.decode(),
		async function (source) {
			for await (const msg of source) {
				let type = msg.slice(0, 1);
				if (type == MSG_TYPE.Message) cm.newMessage(msg.toString(), args);
				else console.error("NOT IMPLEEMENTED YET"); //TODO Settings
			}
		}
	);
}

module.exports = {
	pushableStream,
	readStream,
};
