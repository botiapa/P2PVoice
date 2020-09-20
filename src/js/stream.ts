import type { NetworkedChatMessage, Message } from "./ChatManager";
import ChatManager from "./ChatManager";
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

/**
 * Represent a class which handles a duplex connection with a peer.
 */
export class StreamHandler {
	private originalStream: any;
	private pushStream: any;
	private peerId: string;
	private handlers: { [msgType: number]: ((data: any, peerId: string) => void)[] } = {}; // List of handler functions

	constructor(duplexStream: any, peerId: string) {
		this.peerId = peerId;
		this.originalStream = duplexStream;
		this.pushStream = this.pushableStream();
		this.readStream();
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
	on(msgType: MSG_TYPE, handler: (data: any, peerId: string) => void) {
		this.handlers[msgType] = this.handlers[msgType] ?? []; // Create list for msg_type if null
		this.handlers[msgType].push(handler);
	}
	//TODO: Implement 'off' function if necessary
	private readStream() {
		pipe(
			this.originalStream.source,
			// Decode length-prefixed data
			//lp.decode(),
			async (source: any) => {
				for await (const msg of source) {
					let decoded = this.decodeMessage(msg);
					this.handlers[decoded.type]?.forEach((handler) => {
						handler(decoded.data, this.peerId);
					});
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
		let decoded = msg.toString();
		let obj = JSON.parse(decoded);
		return obj;
	}
}
