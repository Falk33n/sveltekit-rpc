<script lang="ts">
	import { callApi } from '../lib/client/caller';

	async function onclick() {
		const api = await callApi('example.example', {
			input: { id: 'hoho' },
			method: 'post',
		});

		console.log(api);
	}
</script>

<button {onclick}>test</button>
