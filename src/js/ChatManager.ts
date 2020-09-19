import { pushableStream, readStream, MSG_TYPE } from "./stream";
import { v5 as uuidv5 } from "uuid";

var textEncoder = new TextEncoder("utf-8");

export interface BaseConnection {
	peerId: string;
	stream: any; //TODO Define the actual type
	protocol: string;
}

export class NetworkedMessage {
	messageUUID: string;
	msgBody: string;
	constructor(messageUUID: string, msgBody: string) {
		this.messageUUID = messageUUID;
		this.msgBody = msgBody;
	}
}

export class Message {
	messageUUID: string;
	peerId: string;
	displayName: string;
	msgBody: string;
	own: boolean;
	sent: boolean;
	constructor(messageUUID: string, peerId: string, displayName: string, msgBody: string, own: boolean, sent: boolean) {
		this.messageUUID = messageUUID;
		this.peerId = peerId;
		this.displayName = displayName;
		this.msgBody = msgBody;
		this.own = own;
		this.sent = sent;
	}
}

export class UpgradedConnection implements BaseConnection {
	pushStream: any;
	peerId: string;
	stream: any;
	protocol: string;
	constructor(baseConnection: BaseConnection, pushStream: any) {
		this.pushStream = pushStream;
		this.peerId = baseConnection.peerId;
		this.stream = baseConnection.stream;
		this.protocol = baseConnection.protocol;
	}
}

export interface ChatManagerInterface {
	connections: { [peerId: string]: UpgradedConnection };
	messages: { [messageUUID: string]: Message };
	p2p: any;
	onMessagesChanged: (messages: { [messageUUID: string]: Message }) => void;
	onConnectionsChanged: (connections: { [peerId: string]: UpgradedConnection }) => void;
	sendMessage: (peerId: string, msgBody: string) => void;
	newConnection: (connection: BaseConnection) => void;
	newMessage: (message: NetworkedMessage, connection: BaseConnection) => void;
}

export default class ChatManager implements ChatManagerInterface {
	connections: { [peerId: string]: UpgradedConnection } = {};
	messages: { [messageUUID: string]: Message } = {};
	p2p: any;
	constructor(p2p: any) {
		p2p = p2p;
	}
	onMessagesChanged(messages: { [messageUUID: string]: Message }) {}
	onConnectionsChanged(connections: { [peerId: string]: UpgradedConnection }) {}
	sendMessage(peerId: string, msgBody: string) {
		const { pushStream } = this.connections[peerId];
		let uuid = this.getUniqueMessageUUID();
		let msg = new Message(uuid, peerId, peerId, msgBody, true, false);
		this.messages[this.getUniqueMessageUUID()] = msg;
		this.onMessagesChanged(this.messages);
		pushStream.push(encodeMessage(MSG_TYPE.MESSAGE, msgBody));

		msg.sent = true;
		this.messages[uuid] = msg;
		this.onMessagesChanged(this.messages);
		console.log(`Sent message: ${msgBody}`);
		//FIXME Add UUID tp messages
	}
	async newConnection(conn: BaseConnection) {
		readStream(conn.stream, this, conn);
		let ps = await pushableStream(conn.stream);
		this.connections[conn.peerId] = new UpgradedConnection(conn, ps);
		this.onConnectionsChanged(this.connections);
	}
	newMessage(netMsg: NetworkedMessage, conn: BaseConnection) {
		let msg = new Message(netMsg.messageUUID, conn.peerId, conn.peerId, netMsg.msgBody, false, true);
		this.messages[netMsg.messageUUID] = msg;
		this.onMessagesChanged(this.messages);
		console.log(`New message: ${msg}`);
	}
	getUniqueMessageUUID() {
		while (true) {
			let uuid = uuidv5();
			if (!this.messages[uuid]) return uuid;
		}
	}
}

/*export default function chatManager(p2p) {
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
}*/

function encodeMessage(type: MSG_TYPE, msgBody: string) {
	return textEncoder.encode(type.toString() + msgBody);
}
