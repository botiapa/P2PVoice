import { pushableStream, readStream, MSG_TYPE } from "./stream";
import { nanoid } from "nanoid";

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
		this.messages[uuid] = msg;
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
			let uuid = nanoid();
			if (!this.messages[uuid]) return uuid;
		}
	}
}

function encodeMessage(type: MSG_TYPE, msgBody: string) {
	return textEncoder.encode(type.toString() + msgBody);
}
