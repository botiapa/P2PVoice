<script lang="ts">
	import SideBar from "./SideBar.svelte";
	import Chat from "./Chat.svelte";
	import EmptyChat from "./EmptyChat.svelte";
	import type ChatManager from "../js/ChatManager";

	export let p2p: any;
	export let cm: ChatManager;
	let address: string;
	let chatPeerId: string;

	function onChangeChat(peerId) {
		chatPeerId = peerId;
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
		<SideBar {p2p} {cm} {onChangeChat} />
		{#if chatPeerId}
			<Chat peerId={chatPeerId} {cm} />
		{:else}
			<EmptyChat />
		{/if}
	</div>
</main>
