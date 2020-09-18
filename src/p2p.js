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

// Known peers addresses
const bootstrapMultiaddrs = [
	"/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd",
	"/dns4/lon-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3",
];

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
				listen: ["/ip4/0.0.0.0/tcp/0"],
			},
			modules: {
				transport: [TCP, WebSockets],
				connEncryption: [SECIO],
				streamMuxer: [MPLEX],
				peerDiscovery: [MulticastDNS, Bootstrap],
				peerRouting: [KadDHT],
				dht: KadDHT,
			},
			//datastore: new LevelStore("%APPDATA%\\Electron"),
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
			},
		});
		this._setupHandlers();
		this.node.on("error", (err) => {
			console.log(err);
		});
		this.node.connectionManager.on("peer:connect", (connection) => {
			console.log("connected to: ", connection.remotePeer.toB58String());
		});
		this.node.connectionManager.on("peer:disconnected", (connection) => {
			console.log("disconnected from: ", connection.remotePeer.toB58String());
		});
		this.node.on("peer:discovery", async (peer) => {
			console.log("discovered peer: ", peer);
		});

		await this.node.start();
		console.log("libp2p has started");
		console.log("listening on addresses:");
		this.node.multiaddrs.forEach((addr) => {
			console.log(`${addr.toString()}/p2p/${this.node.peerId.toB58String()}`);
		});
		this.onReady();
	},
	_setupHandlers: async function () {
		await this.node.handle("/chat/1.0.0", async ({ connection, stream, protocol }) => {
			await this.ChatManager.newConnection(connection.remotePeer._idB58String, stream, protocol);
		});
	},
	connect: async function (address) {
		if (this.node) {
			let peerId = await PeerId.createFromB58String(address);
			const { stream, protocol } = await this.node.dialProtocol(address, "/chat/1.0.0");
			this.ChatManager.newConnection(ma.getPeerId(), stream, protocol);
			console.log(`Chat connected to: ${ma.getPeerId()}`);
		} else {
			console.error("Tried to connect to a peer, but node is null");
		}
	},
};
