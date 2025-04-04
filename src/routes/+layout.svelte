<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '../lib/components/ui/sonner';
	import '../styles/app.css';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<ModeWatcher />
<Toaster richColors />
{@render children()}
