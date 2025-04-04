import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const config = defineConfig({
	plugins: [tailwindcss(), sveltekit()],
});

export default config;
