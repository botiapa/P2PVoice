import { pushableStream, readStream, MSG_TYPE } from "./stream";

var textEncoder = new TextEncoder("utf-8");

export interface message {
	peerId: string;
	displayName: string;
	msgBody: string;
	own: boolean;
	sent: boolean;
}

export interface cm {}

export default function chatManager(p2p) {
	let cm = {
		connections: {},
		messages: [],
		p2p: p2p,
		onMessagesChanged: (_messages) => {},
		onConnectionsChanged: (_connections) => {},
		sendMessage: async function (peerId: string, msgBody: string) {
			const { ps } = this.connections[peerId];
			this.messages.push({ peerId: peerId, displayName: peerId, own: true, body: msgBody, unsent: true });
			this.onMessagesChanged(this.messages);
			ps.push(encodeMessage(MSG_TYPE.MESSAGE, msgBody));
			this.messages.pop();
			this.messages.push({ peerId: peerId, displayName: peerId, own: true, body: msgBody, unsent: false });
			this.onMessagesChanged(this.messages);
			console.log(`Sent message: ${msgBody}`);
			//FIXME Add UUID tp messages
		},
		newConnection: async function (peerId, stream, protocol) {
			readStream(stream, this, { peerId, stream, protocol });
			let ps = await pushableStream(stream);
			this.connections[peerId] = { stream, protocol, ps };
			this.onConnectionsChanged(this.connections);
		},
		newMessage: async function (msg, args) {
			this.messages.push({ peerId: args.peerId, displayName: args.peerId, own: false, body: msg, unsent: false });
			this.onMessagesChanged(this.messages);
			console.log(`New message: ${msg}`);
		},
	};
	return cm;
}

function encodeMessage(type, msgBody) {
	return textEncoder.encode(type.toString() + msgBody);
}
