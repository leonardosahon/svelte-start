<script lang="ts">
	import { Btn } from '$lib/osai/components/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import Input from '$lib/components/ui/input/input.svelte';
	import type { Component } from 'svelte';
	import type { WeEditor } from '../../core.svelte';

	export type ColorBtnProps = {
		editor: WeEditor | null;
		title: string;
		activeColor?: string;
		activeHighlight?: string;
		presets: {
			name: string;
			value: string;
		}[];
		action: {
			set: (value: string) => boolean | undefined;
			unset: () => boolean | undefined;
		};
		icon: Component;
	};

	let {
		editor,
		title,
		presets,
		icon: Icon,
		activeColor,
		activeHighlight,
		action
	}: ColorBtnProps = $props();
	let selected = $derived<string>(activeColor ?? activeHighlight ?? 'unset');
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger {title}>
		{#snippet child({ props })}
			<Btn variant="ghost" size="icon" style={selected ? 'color:' + selected : ''} {...props}>
				<Icon class="h-4 w-4" />
			</Btn>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		{#each presets as color}
			<DropdownMenu.Item onclick={() => action.set(color.value)}>
				<div class="mr-2 h-4 w-4 rounded" style="background-color: {color.value}"></div>
				{color.name}
			</DropdownMenu.Item>
		{/each}
		<Input
			type="color"
			oninput={() => action.set(selected)}
			class="my-2 h-8 w-full cursor-pointer"
			bind:value={selected}
		/>

		<DropdownMenu.Item onclick={() => action.unset()}>
			Clear {title}
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
