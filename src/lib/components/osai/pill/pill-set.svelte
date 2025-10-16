<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const pillVariants = tv({
		base: 'focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium transition-[color,box-shadow] focus-visible:ring-[3px] [&>svg]:pointer-events-none [&>svg]:size-3',
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground [a&]:hover:bg-primary/90 border-transparent',
				secondary:
					'bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90 border-transparent',
				success:
					'bg-chart-2 [a&]:hover:bg-chart-2/90 focus-visible:ring-chart-2/20 dark:focus-visible:ring-chart-2/40 dark:bg-chart-2/70 border-transparent text-white',
				info: 'bg-chart-3 [a&]:hover:bg-chart-3/90 focus-visible:ring-chart-3/20 dark:focus-visible:ring-chart-3/40 dark:bg-chart-3/70 border-transparent text-white',
				warning:
					'bg-chart-4 [a&]:hover:bg-chart-4/90 focus-visible:ring-chart-4/20 dark:focus-visible:ring-chart-4/40 dark:bg-chart-4/70 border-transparent text-white',
				destructive:
					'bg-destructive [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/70 border-transparent text-white',
				outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground'
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	});

	export type PillVariant = VariantProps<typeof pillVariants>['variant'];
</script>

<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		text,
		href,
		class: className,
		variant = 'default',
		children,
		...restProps
	}: WithElementRef<HTMLAnchorAttributes> & {
		variant?: PillVariant;
		text?: string;
	} = $props();
</script>

<svelte:element
	this={href ? 'a' : 'span'}
	bind:this={ref}
	data-slot="badge"
	{href}
	class={cn(pillVariants({ variant }), className)}
	{...restProps}
>
	{#if text}
		{text}
	{:else}
		{@render children?.()}
	{/if}
</svelte:element>
