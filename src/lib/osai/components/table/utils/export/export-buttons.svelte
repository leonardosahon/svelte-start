<script lang="ts" generics="TData">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { FileMinus, FileSpreadsheet, FileText, FileUp, FileX } from '@lucide/svelte';
	import type { Table } from '@tanstack/table-core';
	import { Btn } from '$lib/osai/components/button';
	import { exportCSV, exportExcel, exportPdf, exportText } from './export-data.js';

	let {
		table
	}: {
		table: Table<TData>;
	} = $props();

	const pageTitle = document.getElementsByTagName('title')[0].text;
</script>

<div class="me-2">
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			{#snippet child({ props })}
				<Btn {...props} variant="outline" title="Export Table" class="ml-auto"><FileUp /></Btn>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end">
			<DropdownMenu.Item onclick={() => exportExcel(table, pageTitle)}
				>Export as Excel <FileX />
			</DropdownMenu.Item>
			<DropdownMenu.Item onclick={() => exportCSV(table, pageTitle)}
				>Export as CSV <FileSpreadsheet />
			</DropdownMenu.Item>
			<DropdownMenu.Item onclick={() => exportText(table, pageTitle)}
				>Export as Text <FileMinus />
			</DropdownMenu.Item>

			<DropdownMenu.Item onclick={() => exportPdf(table, pageTitle)}
				>Export as PDF <FileText />
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>
