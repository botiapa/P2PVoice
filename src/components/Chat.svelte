<script lang="ts">
	import type ChatManager from "../js/ChatManager";
	import type { Message } from "../js/ChatManager";
	import { messages } from "../js/stores";

	export let peerId;
	export let cm: ChatManager;
	let message;
	let displayedMessages = [];
	$: {
		peerId;
		displayedMessages = refreshMessages($messages);
	}

	function refreshMessages(newMessages: { [messageUUID: string]: Message }) {
		displayedMessages = []; //TODO: This is not ideal, there should be a different event for when data changes , and when new messages get added
		for (let uuid in newMessages) {
			let msg = newMessages[uuid];
			if (peerId == msg.peerId || msg.own) displayedMessages.push(msg);
		}
		return displayedMessages;
	}
	async function sendMessage() {
		let _message = message;
		message = ""; // Reset textbox
		await cm.sendMessage(peerId, _message);
	}
</script>

<style>
	main {
		display: flex;
		flex: 1;
		flex-direction: column;
		align-items: flex-start;
	}

	h2 {
		color: white;
	}

	form {
		display: flex;
		align-content: stretch;
	}

	input {
		flex: 1;
		margin: 10px 0;
		border: none;
	}

	input:focus {
		outline: none;
	}

	input[type="submit"] {
		flex: 0;
		margin: 0;
		width: 0;
	}

	.message {
		margin-top: 0.5rem;
	}

	.name,
	.message-body {
		text-align: left;
	}

	.name {
		color: white;
	}

	.message-body {
		color: #e9e9e9;
	}

	.unsent {
		color: #7d7d7d !important;
	}

	#topbar {
		padding-left: 5px;
		border-bottom: #515151 1px solid;
	}

	#bottombar {
		align-self: stretch;
	}

	#chat {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		align-self: stretch;
		overflow: auto;
		padding: 10px;
		flex: 1;
	}

	#msgbox {
		margin: 20px;
		background-color: #3c3c3c;
		color: #bebebe;
		border-radius: 15px;
	}
</style>

<main>
	<div id="topbar">
		<h2>{peerId}</h2>
	</div>
	<div id="chat">
		{#each displayedMessages as msg}
			<div class="message">
				<div class="name">{msg.displayName}</div>
				<div class="message-body {!msg.unsent || 'unsent'}">{msg.msgBody}</div>
			</div>
		{/each}
	</div>
	<div id="bottombar">
		<form on:submit|preventDefault={sendMessage}>
			<input id="msgbox" placeholder="Send message to {peerId}" bind:value={message} /><input type="submit" style="visibility: hidden;" />
		</form>
	</div>
</main>
