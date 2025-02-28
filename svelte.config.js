import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
export default {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		alias: {
			'$styles': './src/app.css',
			'$schemas': './src/lib/schemas.ts',
			'$utils': './src/lib/utils.ts',
			'$types': './src/lib/types.ts',
			'$server': './src/lib/server/index.ts',
			'$server/*': './src/lib/server/*',
			'$schemas': './src/lib/schemas/index.ts',
		},
	},
};
