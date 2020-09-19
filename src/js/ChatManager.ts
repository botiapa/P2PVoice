import { StreamHandler, MSG_TYPE } from "./stream.ts";
import { nanoid } from "nanoid";
export interface BaseConnection {
	peerId: string;
	stream: any; //TODO Define the actual type
	protocol: string;
}

export class NetworkedChatMessage {
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
	streamHandler: StreamHandler;
	peerId: string;
	stream: any;
	protocol: string;
	constructor(baseConnection: BaseConnection, streamHandler: StreamHandler) {
		this.streamHandler = streamHandler;
		this.peerId = baseConnection.peerId;
		this.stream = baseConnection.stream;
		this.protocol = baseConnection.protocol;
	}
}

export default class ChatManager {
	connections: { [peerId: string]: UpgradedConnection } = {};
	messages: { [messageUUID: string]: Message } = {};
	p2p: any;
	constructor(p2p: any) {
		p2p = p2p;
	}
	onMessagesChanged(messages: { [messageUUID: string]: Message }) {}
	onConnectionsChanged(connections: { [peerId: string]: UpgradedConnection }) {}
	sendMessage(peerId: string, msgBody: string) {
		const { streamHandler } = this.connections[peerId];
		let uuid: string = this.getUniqueMessageUUID();
		let msg = new Message(uuid, peerId, peerId, msgBody, true, false);
		this.messages[uuid] = msg;
		this.onMessagesChanged(this.messages);
		streamHandler.sendChatMessage(msg);

		msg.sent = true;
		this.messages[uuid] = msg;
		this.onMessagesChanged(this.messages);
		console.log(`Sent message: ${msgBody}`);
		//FIXME Add UUID tp messages
	}
	async newConnection(conn: BaseConnection) {
		let sh = new StreamHandler(conn.stream, conn.peerId);
		sh.onChatMessageReceived = this.newMessage;
		this.connections[conn.peerId] = new UpgradedConnection(conn, sh);
		this.onConnectionsChanged(this.connections);
	}
	newMessage(peerId: string, netMsg: NetworkedChatMessage) {
		let msg = new Message(netMsg.messageUUID, peerId, peerId, netMsg.msgBody, false, true);
		this.messages[netMsg.messageUUID] = msg;
		this.onMessagesChanged(this.messages);
		console.log(`New message: ${msg.msgBody} with id: ${msg.messageUUID}`);
	}
	getUniqueMessageUUID() {
		while (true) {
			let uuid = nanoid();
			if (!this.messages[uuid]) return uuid;
		}
	}
}
