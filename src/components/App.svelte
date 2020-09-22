<script lang="ts">
	import Welcome from "./Welcome.svelte";
	import MainScreen from "./MainScreen.svelte";
	import P2P from "../js/p2p";
	import ChatManager from "../js/ChatManager";
	import { name } from "../js/stores";

	let p2p: any;
	async function main() {
		p2p = P2P;
		await p2p.init();
	}
	main();
	let cm = new ChatManager(p2p);
	p2p.ChatManager = cm;
</script>

<style>
	main {
		display: flex;
		flex: 1;
		align-items: stretch;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}
</style>

<main>
	{#if !$name}
		<Welcome />
	{:else}
		<MainScreen {p2p} {cm} />
	{/if}
</main>
