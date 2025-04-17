<script lang="ts">
	import { callApi } from '../lib/client/caller';

	async function onclick() {
		// Fully typesafe api caller, that will give you the correct input,
		// output and method based on the endpoint string.
		const api = await callApi('example.example', {
			input: { id: 'hoho' },
			method: 'post',
		});

		// Logs the return object of the api.
		console.log(api);
	}
</script>

<button {onclick}>test</button>
