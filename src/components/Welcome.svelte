<script lang="ts">
	import { name } from "../js/stores";

	let inputValue;
</script>

<style>
	main {
		text-align: center;
		max-width: 240px;
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

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>

<main>
	<h1>Hello stranger!</h1>
	<h3>Please choose a name to continue</h3>
	<div>
		<form on:submit|preventDefault>
			<input placeholder="Enter a name" bind:value={inputValue} />
			<input
				type="submit"
				on:click={() => {
					$name = inputValue;
				}} />
		</form>
	</div>
</main>
