<script>
	export let peerId;
	export let cm;
	let message;

	const Store = require("electron-store");
	import P2P from "./p2p";

	const store = new Store();

	let messages = [];
	cm.onMessagesChanged = function (msgs) {
		messages = msgs;
		for (let msg in msgs) {
			if (msg.peerId == peerId) messages.push(msg);
		}
	};
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
		{#each messages as msg}
			<div class="message">
				<div class="name">{msg.name}</div>
				<div class="message-body {!msg.unsent || 'unsent'}">{msg.body}</div>
			</div>
		{/each}
	</div>
	<div id="bottombar">
		<form on:submit|preventDefault={sendMessage}>
			<input id="msgbox" placeholder="Send message to {peerId}" bind:value={message} /><input type="submit" style="visibility: hidden;" />
		</form>
	</div>
</main>
