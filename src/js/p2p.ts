const Libp2p = require("libp2p");
const TCP = require("libp2p-tcp");
const WebSockets = require("libp2p-websockets");
const SECIO = require("libp2p-secio");
const MPLEX = require("libp2p-mplex");
const KadDHT = require("libp2p-kad-dht");
const LevelStore = require("datastore-level");
const multiaddr = require("multiaddr");
const MulticastDNS = require("libp2p-mdns");
const Bootstrap = require("libp2p-bootstrap");
const PeerId = require("peer-id");
const WStar = require("libp2p-webrtc-star");
const wrtc = require("wrtc");
import { peers, connections, metricStats } from "../js/stores";

import type BaseConnection from "./ChatManager";

// Known peers addresses
const bootstrapMultiaddrs = [
	"/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd",
	"/dns4/lon-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3",
];

const transportKey = WStar.prototype[Symbol.toStringTag];

enum Protocols {
	text = "p2pvoice-text",
	audio = "p2pvoice-audio",
}

export default {
	node: null,
	onReady: () => {},
	ChatManager: null,
	init: async function () {
		this.node = await Libp2p.create({
			dialer: {
				maxParallelDials: 100,
				maxDialsPerPeer: 4,
				dialTimeout: 30e3,
			},
			addresses: {
				// add a listen address (localhost) to accept TCP connections on a random port
				listen: [
					"/ip4/0.0.0.0/tcp/0",
					"/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star",
					"/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star",
				],
			},
			modules: {
				transport: [TCP, WebSockets, WStar],
				connEncryption: [SECIO],
				streamMuxer: [MPLEX],
				peerDiscovery: [MulticastDNS, Bootstrap],
				peerRouting: [KadDHT],
				dht: KadDHT,
			},
			metrics: {
				enabled: true,
				computeThrottleMaxQueueSize: 1000,
				computeThrottleTimeout: 2000,
				movingAverageIntervals: [
					30 * 1000, // 30 second
					2 * 60 * 1000, // 2 minutes
					10 * 60 * 1000, // 10 minutes
				],
				maxOldPeersRetention: 50,
			},
			//TODO
			//datastore: new LevelStore("./peers/"),
			peerStore: {
				persistence: true,
				threshold: 5,
			},
			config: {
				dht: {
					enabled: true,
					randomWalk: {
						enabled: true, // Allows to disable discovery (enabled by default)
						interval: 300e3,
						timeout: 10e3,
					},
				},
				peerDiscovery: {
					autoDial: true,
					[MulticastDNS.tag]: {
						enabled: true,
					},
					[Bootstrap.tag]: {
						enabled: true,
						list: bootstrapMultiaddrs, // provide array of multiaddrs
					},
				},
				transport: {
					[transportKey]: {
						wrtc,
					},
				},
			},
		});
		this._setupHandlers();
		this.node.on("error", (err) => {
			console.log(err);
		});
		this.node.connectionManager.on("peer:connect", (connection: any) => {
			connections.set(this.node.connectionManager.connections);
			console.log("connected to: ", connection.remotePeer.toB58String());
		});
		this.node.connectionManager.on("peer:disconnect", (connection: any) => {
			connections.set(this.node.connectionManager.connections);
			console.log("disconnected from: ", connection.remotePeer.toB58String());
		});
		this.node.peerStore.on("peer", (peerId) => {
			peers.set(this.node.peerStore.addressBook.data);
		});
		this.node.on("peer:discovery", async (peer) => {
			console.log("discovered peer: ", peer);
		});
		window.setInterval(() => {
			metricStats.set(this.node.metrics.global.snapshot);
		}, 1000);
		await this.node.start();
		console.log("libp2p has started");
		console.log("listening on addresses:");
		this.node.multiaddrs.forEach((addr) => {
			console.log(`${addr.toString()}/p2p/${this.node.peerId.toB58String()}`);
		});
		this.onReady();
	},
	_setupHandlers: async function () {
		await this.node.handle(Protocols.text, async ({ connection, stream, protocol }) => {
			let peerId = connection.remotePeer.toB58String();
			await this.ChatManager.newConnection({ peerId, stream, protocol });
		});
	},
	connect: async function (address) {
		if (this.node) {
			let peerId = await PeerId.createFromB58String(address);
			let B85 = peerId.toB58String();
			const { stream, protocol } = await this.node.dialProtocol(peerId, Protocols.text);
			this.ChatManager.newConnection({ peerId: B85, stream, protocol });
			console.log(`Chat connected to: ${peerId}`);
		} else {
			console.error("Tried to connect to a peer, but node is null");
		}
	},
};
