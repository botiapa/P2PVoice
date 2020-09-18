import { pushableStream, readStream } from "./stream";

var textEncoder = new TextEncoder("utf-8");

export default function chatManager(p2p) {
	let cm = {
		connections: {},
		messages: [],
		p2p: p2p,
		onMessagesChanged: (_messages) => {},
		onConnectionsChanged: (_connections) => {},
		sendMessage: async function (peerId, msgBody) {
			const { ps } = this.connections[peerId];
			this.messages.push({ name: peerId, own: true, body: msgBody, unsent: true });
			ps.push(textEncoder.encode(msgBody));
			this.messages.pop();
			this.messages.push({ name: peerId, own: true, body: msgBody, unsent: false });
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
			this.messages.push({ name: args.peerId, own: false, body: msg, unsent: false });
			this.onMessagesChanged(this.messages);
			console.log(`New message: ${msg}`);
		},
	};
	return cm;
}
