<script lang="ts">
	import { Btn } from '$lib/components/osai/button';
	import { Icon } from '@lucide/svelte';

	let {
		icon: IconElement,
		type,
		onclick
	}: {
		icon: typeof Icon;
		type: string;
		onclick: (e: Event) => void;
	} = $props();
</script>

<Btn {onclick} data-type={type} class="outline-none" variant="ghost" size="icon">
	<IconElement />
</Btn>
