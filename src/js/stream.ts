import type { NetworkedChatMessage, Message } from "./ChatManager.ts";
import pipe from "it-pipe";
const pushable = require("it-pushable");
const lp = require("it-length-prefixed");
const uint8ArrayToString = require("uint8arrays/to-string");

var textEncoder = new TextEncoder("utf-8");
var textDecoder = new TextDecoder("utf-8");

export enum MSG_TYPE {
	SETTINGS = 0,
	CHAT_MESSAGE = 1,
}

interface NetworkMessage {
	type: MSG_TYPE;
	data: any;
}

export class StreamHandler {
	private originalStream: any;
	private pushStream: any;
	private peerId: string;
	onChatMessageReceived(peerId: string, message: NetworkedChatMessage) {}

	constructor(duplexStream: any, peerId: string) {
		this.peerId = peerId;
		this.originalStream = duplexStream;
		this.pushStream = this.pushStream();
		this.readStream();
	}
	private readStream() {
		pipe(
			this.originalStream.source,
			// Decode length-prefixed data
			//lp.decode(),
			async (source: any) => {
				for await (const msg of source) {
					let decoded = this.decodeMessage(msg);
					if (decoded.type == MSG_TYPE.CHAT_MESSAGE) this.onChatMessageReceived(this.peerId, decoded.data);
					else console.error("NOT IMPLEEMENTED YET"); //TODO Settings
				}
			}
		);
	}
	private pushableStream() {
		// Read utf-8 from stdin
		const source = pushable();
		pipe(
			source,
			//lp.encode(),
			this.originalStream.sink
		);
		return source;
	}
	private encodeMessage(msg: NetworkMessage) {
		let json = JSON.stringify({ type: msg.type, data: msg.data });
		let encoded = textEncoder.encode(json);
		return encoded;
	}

	private decodeMessage(msg: any): NetworkMessage {
		let decoded = textDecoder.decode(msg);
		let obj = JSON.parse(decoded);
		return obj;
	}

	sendMessage(type: MSG_TYPE, data: any) {
		let encoded = this.encodeMessage({ type, data });
		this.pushStream.push(encoded);
	}
	sendChatMessage(msg: NetworkedChatMessage) {
		let type = MSG_TYPE.CHAT_MESSAGE;
		let encoded = this.encodeMessage({ type, data: msg });
		this.pushStream.push(encoded);
	}
}
