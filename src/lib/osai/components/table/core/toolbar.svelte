<script lang="ts" generics="TData">
	import { Input } from '$lib/components/ui/input/index.js';
	import XIcon from '@lucide/svelte/icons/x';
	import type { Table } from '@tanstack/table-core';
	import type { Snippet } from 'svelte';
	import { Btn } from '../../button/index.js';
	import DateRangeFilter from '../utils/date-range/date-range-filter.svelte';
	import ExportButtons from '../utils/export/export-buttons.svelte';
	import FacetedFilter from '../utils/faceted-filter.svelte';
	import HideColumns from '../utils/hide-columns.svelte';
	import type { TableFiltersObject } from './types.js';

	let {
		table,
		searchHolder,
		facetedFilter,
		dateRangeColumns,
		useExport,
		prependToolbar,
		appendToolbar
	}: {
		table: Table<TData>;
		searchHolder?: string;
		facetedFilter?: TableFiltersObject;
		dateRangeColumns?: { [key: string]: string };
		useExport?: boolean;
		prependToolbar?: Snippet;
		appendToolbar?: Snippet;
	} = $props();

	const isFiltered = $derived(table.getState().columnFilters.length > 0);
</script>

<div class="mb-4 flex items-center justify-between overflow-auto">
	<div class="flex flex-1 items-center space-x-2">
		{@render prependToolbar?.()}

		<Input
			placeholder={searchHolder ?? 'Search table...'}
			value={(table.getState().globalFilter as string) ?? ''}
			oninput={(e) => table.setGlobalFilter(e.currentTarget.value)}
			class="h-8 w-[150px] lg:w-[250px]"
		/>

		{#if facetedFilter}
			{#each Object.entries(facetedFilter) as [id, filter] (filter.id)}
				{@const col = table.getColumn(id)}
				{#if col}
					<FacetedFilter
						column={col}
						title={filter.title ?? id.toUpperCase()}
						options={filter.options}
					/>
				{/if}
			{/each}
		{/if}

		{#if isFiltered}
			<Btn
				title="Reset filters"
				variant="ghost"
				onclick={() => table.resetColumnFilters()}
				class="h-8 px-2 lg:px-3"
			>
				<XIcon /> reset
			</Btn>
		{/if}
	</div>

	{#if dateRangeColumns}
		{#each Object.entries(dateRangeColumns) as [id, name] (id)}
			{@const col = table.getColumn(id)}
			<DateRangeFilter {name} column={col!} />
		{/each}
	{/if}

	{#if useExport}
		<ExportButtons {table} />
	{/if}

	<HideColumns {table} />

	{@render appendToolbar?.()}
</div>
