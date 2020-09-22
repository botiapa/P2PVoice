import { StreamHandler, MSG_TYPE } from "./stream.ts";
import { nanoid } from "nanoid";
import { messages } from "../js/stores";

export interface BaseConnection {
	peerId: string;
	stream: any; //TODO Define the actual type
	protocol: string;
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

export default class ChatManager {
	connections: { [peerId: string]: UpgradedConnection } = {};
	messages: { [messageUUID: string]: Message } = {};
	p2p: any;
	constructor(p2p: any) {
		this.p2p = p2p;
	}
	onConnectionsChanged(connections: { [peerId: string]: UpgradedConnection }) {}
	sendMessage(peerId: string, msgBody: string) {
		const { streamHandler } = this.connections[peerId];
		let uuid: string = this.getUniqueMessageUUID();
		let msg = new Message(
			uuid,
			this.p2p.node.peerId.toB58String(),
			this.p2p.node.peerId.toB58String(),
			msgBody,
			true,
			false
		); //FIXME It should pass in their own peerId and not the receiver's
		this.messages[uuid] = msg;
		messages.set(this.messages); // Update store, therefore the UI which binds to it
		streamHandler.sendChatMessage(msg as NetworkedChatMessage);
		msg.sent = true;
		this.messages[uuid] = msg;
		messages.set(this.messages);
		console.log(`Sent message: ${msgBody}`);
		//FIXME Add UUID tp messages
	}
	async newConnection(conn: BaseConnection) {
		let sh = new StreamHandler(conn.stream, conn.peerId);
		sh.on(MSG_TYPE.CHAT_MESSAGE, (data: NetworkedChatMessage, peerId: string) => {
			this.newMessage(peerId, data);
		});
		this.connections[conn.peerId] = new UpgradedConnection(conn, sh);
		this.onConnectionsChanged(this.connections);
	}
	newMessage(peerId: string, netMsg: NetworkedChatMessage) {
		let msg = new Message(netMsg.messageUUID, peerId, peerId, netMsg.msgBody, false, true);
		this.messages[netMsg.messageUUID] = msg;
		messages.set(this.messages);
		console.log(`New message: ${msg.msgBody} with id: ${msg.messageUUID}`);
	}
	getUniqueMessageUUID() {
		while (true) {
			let uuid = nanoid();
			if (!this.messages[uuid]) return uuid;
		}
	}
}
