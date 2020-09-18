<script>
	export let p2p;
	export let cm;
	export let onChangeChat = (peer) => {};

	let address;
	let connections = {};

	const Store = require("electron-store");
	const store = new Store();

	cm.onConnectionsChanged = function (_connections) {
		connections = _connections;
	};
	p2p.onReady = () => {
		p2p.node.peerStore.on("peer", (peerId) => {
			console.log(`New Peer: ${peerId}`);
		});
		p2p.node.peerStore.on("change:multiaddrs", ({ peerId, multiaddrs }) => {
			console.log(`Multiaddress change for peer: ${peerId} with the following adresses: ${multiaddrs}`);
		});
		p2p.node.peerStore.on("change:protocols", ({ peerId, protocols }) => {
			console.log(`Protocol change for peer: ${peerId} with the following protocols: ${protocols}`);
		});
	};
	async function addAddress() {
		await p2p.connect(address);
	}
</script>

<style>
	form {
		margin: 10px;
	}
	main {
		background-color: #3c3c3c;
		border-radius: 3px;
		color: white;
		min-width: 150px;
		margin: 1rem;
	}

	.peer {
		background-color: #262626;
		border-radius: 3px;
		margin: 5px;
		padding: 5px;
		cursor: pointer;
	}

	.peer:hover {
		background-color: #303030;
	}
</style>

<main>
	<form on:submit|preventDefault={addAddress}><input type="text" bind:value={address} /> <input type="submit" /></form>
	<hr />
	<p>Peers</p>
	<div>
		{#each Object.entries(connections) as [peerId, c]}
			<div class="peer" on:click={onChangeChat(peerId)}>{peerId.substr(peerId.length - 10).toUpperCase()}</div>
		{/each}
	</div>
</main>
