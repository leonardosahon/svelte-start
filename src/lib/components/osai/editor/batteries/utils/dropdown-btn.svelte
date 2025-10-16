<script lang="ts">
	import { Btn } from '$lib/components/osai/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { ChevronDown } from '@lucide/svelte';
	import type { Component } from 'svelte';

	export type DropdownBtnProps = {
		title: string;
		entries: DropdownEntries;
		activeState: () => DropdownActiveState;
		accentColor: string;
	};

	export type DropdownActiveState = {
		title: string;
		icon: Component;
		value?: string;
		style?: string;
		go: () => boolean | undefined;
		default?: boolean;
		keywords?: string[];
	};

	export type DropdownEntries = { [key: string]: DropdownActiveState };

	let { title, entries, activeState, accentColor }: DropdownBtnProps = $props();

	const current = $derived(activeState());
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger {title}>
		{#snippet child({ props })}
			<Btn variant="ghost" class={current.default ? '' : accentColor} size="sm" {...props}>
				{@const Icon = current.icon}
				<Icon class="h-4 w-4" />
				<ChevronDown class="h-3 w-3" />
			</Btn>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		{#each Object.entries(entries) as [id, head] (id)}
			{@const Icon = head.icon}
			<DropdownMenu.Item onclick={() => head.go()} class="relative" style={head?.style}>
				<Icon class="mr-2 ml-1 h-4 w-4" />
				{head.title}
				<div
					class={'absolute top-3 left-0 h-2 w-2 rounded-full ' +
						(current.title === head.title ? accentColor : '')}
				></div>
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
