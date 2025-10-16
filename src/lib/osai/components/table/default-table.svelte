<script lang="ts">
	import { FlexRender } from '$lib/components/ui/data-table';
	import * as Table from '$lib/components/ui/table';
	import Footbar from './core/footbar.svelte';
	import { InitTable } from './core/init.svelte';
	import Toolbar from './core/toolbar.svelte';
	import type { TableActions, TableColumns, TableData } from './core/types';

	let {
		data,
		columns,
		actions,
		actionsAsBtn = false,
		searchHolder,
		sn = true,
		select = false,
		searchAll = false,
		useExport = true,
		appendToolbar,
		prependToolbar
	}: {
		searchHolder?: string;
		sn?: boolean;
		select?: boolean;
		searchAll?: boolean;
		useExport?: boolean;
		data: TableData;
		columns: TableColumns;
		actions?: TableActions;
		actionsAsBtn?: boolean;
		appendToolbar?: any;
		prependToolbar?: any;
	} = $props();

	const init = new InitTable({
		data,
		columns,
		actions,
		actionsAsBtn,
		sn,
		select,
		searchAll
	});

	const table = init.table;
	const facetedFilter = init.facetedFilters;
	const dateRangeColumns = init.dateRangeColumns;

	let previousDataList = data.list;

	$effect(() => {
		if (data.list !== previousDataList) {
			previousDataList = data.list;
			init.updateData(data);
		}
	});
</script>

<div>
	<Toolbar
		{table}
		{searchHolder}
		{useExport}
		{facetedFilter}
		{dateRangeColumns}
		{appendToolbar}
		{prependToolbar}
	/>

	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<Table.Row>
						{#each headerGroup.headers as header (header.id)}
							<Table.Head colspan={header.colSpan}>
								{#if !header.isPlaceholder}
									<FlexRender
										content={header.column.columnDef.header}
										context={header.getContext()}
									/>
								{/if}
							</Table.Head>
						{/each}
					</Table.Row>
				{/each}
			</Table.Header>
			<Table.Body>
				{#each table.getRowModel().rows as row (row.id)}
					<Table.Row data-state={row.getIsSelected() && 'selected'}>
						{#each row.getVisibleCells() as cell (cell.id)}
							<Table.Cell>
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</Table.Cell>
						{/each}
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={init.definedColumns.length} class="h-24 text-center"
							>No results.</Table.Cell
						>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	<Footbar {table} {select} />
</div>
