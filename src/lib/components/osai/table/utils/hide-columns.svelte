<script lang="ts" generics="TData">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Eye } from '@lucide/svelte';
	import type { Table } from '@tanstack/table-core';
	import { Btn } from '../../button';

	let {
		table
	}: {
		table: Table<TData>;
	} = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Btn {...props} variant="outline" class="ml-auto"><Eye /></Btn>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		{#each table.getAllColumns().filter((col) => col.getCanHide()) as column (column.id)}
			<DropdownMenu.CheckboxItem
				class="capitalize"
				bind:checked={() => column.getIsVisible(), (v) => column.toggleVisibility(!!v)}
			>
				{column.id}
			</DropdownMenu.CheckboxItem>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
