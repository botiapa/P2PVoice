<script>
	export let p2p;
	export let onChangeChat = (peer) => {};
	let address;

	const Store = require("electron-store");
	const store = new Store();

	let peers = {};
	p2p.onReady = () => {
		p2p.node.peerStore.on("peer", (peerId) => {
			console.log(`New Peer: ${peerId}`);
			peers[peerId] = { peerId: peerId };
		});
		p2p.node.peerStore.on("change:multiaddrs", ({ peerId, mas }) => {
			console.log(`Multiaddress change for peer: ${peerId} with the following adresses: ${mas}`);
			if (!peers[peerId]) peers[peerId] = { peerId: peerId };
			peers[peerId].mas = mas;
			peers = peers;
		});
		p2p.node.peerStore.on("change:protocols", ({ peerId, protocols }) => {
			console.log(`Protocol change for peer: ${peerId} with the following protocols: ${mas}`);
			if (!peers[peerId]) peers[peerId] = { peerId: peerId };
			peers[peerId].protocols = protocols;
			peers = peers;
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
		{#each Object.entries(peers) as [peerId, peer]}
			<div class="peer" on:click={onChangeChat(peer)}>{peerId.substr(peerId.length - 10).toUpperCase()}</div>
		{/each}
	</div>
</main>
