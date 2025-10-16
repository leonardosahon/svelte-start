<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { cn } from '$lib/utils';

	let {
		title,
		children,
		icon,
		class: className,
		headerClass,
		titleClass,
		description,
		footer
	}: {
		title?: string;
		children?: any;
		icon?: any;
		footer?: any;
		class?: string;
		headerClass?: string;
		titleClass?: string;
		description?: string;
	} = $props();
</script>

<Card.Root class={cn(className, 'gap-3')}>
	{#if title || icon}
		<Card.Header class={headerClass}>
			<div class="align-items-center flex flex-wrap gap-2">
				{@render icon?.()}
				{#if title}
					<Card.Title class={titleClass}>
						{title}
					</Card.Title>
				{/if}
			</div>
			<Card.Description>{description}</Card.Description>
		</Card.Header>
	{/if}
	<Card.Content>
		{@render children?.()}
	</Card.Content>
	<Card.Footer>
		{@render footer?.()}
	</Card.Footer>
</Card.Root>
