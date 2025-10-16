<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		ref = $bindable(),
		children,
		class: className
	}: {
		ref: HTMLElement | undefined;
		children: any;
		class?: string;
	} = $props();
</script>

<div
	bind:this={ref}
	class={cn(
		'bg-popover flex max-w-[450px] items-center gap-1 rounded-lg border px-2 py-1 shadow-lg lg:max-w-[600px]',
		className
	)}
>
	{@render children?.()}
</div>
