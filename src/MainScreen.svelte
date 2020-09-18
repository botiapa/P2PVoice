<script>
	import SideBar from "./SideBar.svelte";
	import Chat from "./Chat.svelte";
	import EmptyChat from "./EmptyChat.svelte";

	export let p2p;
	export let cm;
	let address;
	let chatPeer;

	const Store = require("electron-store");
	const store = new Store();

	let name;
	async function submit() {
		await p2p.connect(address);
	}

	function onChangeChat(peer) {
		chatPeer = peer;
	}
</script>

<style>
	main {
		text-align: center;
		max-width: 240px;
		margin: 0 auto;
		height: 100%;
		flex: 1;
	}

	#chat {
		flex: 1;
	}

	h1 {
		color: white;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	h3 {
		color: beige;
	}

	#container {
		display: flex;
		flex-direction: row;
		height: inherit;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>

<main>
	<div id="container">
		<SideBar {p2p} {onChangeChat} />
		{#if chatPeer}
			<Chat peer={chatPeer} {cm} />
		{:else}
			<EmptyChat />
		{/if}
	</div>
</main>
