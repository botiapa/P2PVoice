<script lang="ts">
	import type ChatManager from "../js/ChatManager";

	export let p2p: any;
	export let cm: ChatManager;
	export let onChangeChat: (peer) => void;

	let address: string;
	let connections = {};

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
		display: flex;
		flex-direction: column;
	}

	.block {
		background-color: #3c3c3c;
		border-radius: 3px;
		color: white;
		min-width: 150px;
		margin: 0.5rem;
		padding: 0.3rem;
	}

	.no-peers {
		color: #3c3c3c;
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

	#stats {
		text-align: left;
	}

	#list {
		flex: 1;
	}
</style>

<main>
	<div class="block" id="stats">
		<div>Discovered peers:</div>
		<div>Connected peers:</div>
	</div>
	<div class="block" id="list">
		<form on:submit|preventDefault={addAddress}>
			<input type="text" bind:value={address} />
			<input type="submit" />
		</form>
		<hr />
		{#if Object.entries(connections).length == 0}
			<div class="no-peers">Peers will appear here</div>
		{/if}
		<div>
			{#each Object.entries(connections) as [peerId]}
				<div class="peer" on:click={() => onChangeChat(peerId)}>{peerId.substr(peerId.length - 10).toUpperCase()}</div>
			{/each}
		</div>
	</div>
</main>
