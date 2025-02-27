import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
export default {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		alias: {
			'$styles': './src/app.css',
			'$utils': './src/lib/utils.ts',
			'$types': './src/lib/types.ts',
			'$components': './src/lib/components',
			'$components/*': './src/lib/components/*',
		},
	},
};
