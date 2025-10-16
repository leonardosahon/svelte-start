<script lang="ts">
	import { Button, type ButtonProps } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { LoaderCircle } from '@lucide/svelte';

	let {
		ref = $bindable(null),
		loading = false,
		loadingText,
		disabled = false,
		type = 'submit',
		class: className = '',
		children,
		...restProps
	}: ButtonProps & {
		loading?: boolean;
		loadingText?: string;
	} = $props();

	const baseClass = 'cursor-pointer';
</script>

<Button
	bind:ref
	class={cn(className, baseClass)}
	disabled={disabled || loading}
	{...restProps}
	{type}
>
	{#if loading}
		<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
		{loadingText || 'Loading...'}
	{:else}
		{@render children?.()}
	{/if}
</Button>
