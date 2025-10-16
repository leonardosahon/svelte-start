/* eslint-disable @typescript-eslint/no-explicit-any */
import { Checkbox } from '$lib/components/ui/checkbox';
import { createSvelteTable, renderComponent, renderSnippet } from '$lib/components/ui/data-table';
import {
	type ColumnDef,
	type ColumnFiltersState,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type PaginationState,
	type Row,
	type RowData,
	type RowSelectionState,
	type SortingState,
	type Table,
	type VisibilityState
} from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import { dateRangeFilter } from '../utils/date-range/filter';
import ColumnHeader from './column-header.svelte';
import RowActions from './row-actions.svelte';
import type { TableActions, TableColumns, TableData, TableFiltersObject } from './types';

export class InitTable<TData extends RowData = any, T = any> {
	public table: Table<any>;
	public definedColumns: ColumnDef<any, any>[] = [];
	public facetedFilters: TableFiltersObject = {};
	public dateRangeColumns: { [key: string]: string } = {};

	private columns: TableColumns;
	private data: TableData;
	private actions?: TableActions;
	private actionsAsBtn?: boolean;
	private select: boolean;
	private sn: boolean;
	private searchAll: boolean;
	private definedData = $state<TData[]>([]);

	constructor({
		data,
		columns,
		actions,
		actionsAsBtn,
		select = false,
		searchAll = false,
		sn = true
	}: {
		select?: boolean;
		sn?: boolean;
		searchAll?: boolean;
		data: TableData;
		columns: TableColumns;
		actions?: TableActions;
		actionsAsBtn?: boolean;
	}) {
		this.columns = columns;
		this.data = data;
		this.actions = actions;
		this.actionsAsBtn = actionsAsBtn;
		this.select = select;
		this.searchAll = searchAll;
		this.sn = sn;

		// Checkboxes and Serial Numbers cannot be active at the same time
		if (select) this.sn = false;

		if (this.sn) {
			this.columns = [{ name: '#', id: 'sn', canHide: false }, ...this.columns];
		}

		this.definedData = this.makeData();
		this.table = this.makeTable();
	}

	private globalFilter(row: Row<any>, columnId: string, filterValue: string): any {
		return row.getValue(columnId)?.toString().toLowerCase().includes(filterValue.toLowerCase());
	}

	private columnFilter(row: Row<any>, columnId: string, filterValue: []): any {
		return filterValue.includes(row.getValue(columnId));
	}

	private makeData(): TData[] {
		return this.data.list.map((obj: T, index: number) => {
			const x: TData = this.data.map(obj, index);

			//@ts-expect-error Adding numbered index for reference
			x['index'] = index;

			//@ts-expect-error Adding serial number for reference
			if (this.sn) x['sn'] = index + 1;

			return x;
		});
	}

	private makeColumns(): void {
		// The first item on the table headers
		if (this.select)
			this.definedColumns.push({
				id: 'select',
				header: ({ table }) =>
					renderComponent(Checkbox, {
						checked: table.getIsAllPageRowsSelected(),
						onCheckedChange: (value) => table.toggleAllPageRowsSelected(value),
						indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
						'aria-label': 'Select all'
					}),
				cell: ({ row }) =>
					renderComponent(Checkbox, {
						checked: row.getIsSelected(),
						onCheckedChange: (value) => row.toggleSelected(value),
						'aria-label': 'Select row',
						'data-value': row.original.id
					}),
				enableSorting: false,
				enableHiding: false
			});

		// Everything in-between
		for (const col of this.columns) {
			const id = col.id ?? col.name.toLowerCase();
			const canSort = col.canSort ?? true;
			const canHide = col.canHide ?? true;
			const canSearch = this.searchAll || (col.canSearch ?? false);

			let filterFn = undefined;

			if (col.canFilter || col.filter?.map || col.filter?.lateOptions || col.filter?.options) {
				// By default if you use just [canFilter]. The table will attempt to populate the faceted filter with unique values from the cells.
				// This is avoids forcing you to fetch the filter values from your backend

				filterFn = col.filter?.fn ?? this.columnFilter;
				this.facetedFilters[id] = { title: col.name, id: id, options: [] };

				// However, if you have your filter values already, then you can pass them directly
				// The facted filters will get rendered with them
				if (col.filter?.options) {
					this.facetedFilters[id].options = col.filter.options;
				}

				// Finally if you are getting your values from a backend on the client side, this is the way to go.
				// It will get the first value from your source, and if the source changes its value, this will trickle down the wire.
				if (col.filter?.lateOptions) {
					const derived = $derived.by(() => {
						const raw = col.filter!.source!();
						return col.filter!.lateOptions!(raw);
					});

					this.facetedFilters[id] = {
						title: col.name,
						id: id,
						get options() {
							return derived;
						}
					};
				}
			}

			if (col.canDateRange || col.dateRange) {
				filterFn = col.dateRange ?? dateRangeFilter;
				this.dateRangeColumns[id] = col.name;
			}

			this.definedColumns.push({
				accessorKey: id,
				enableSorting: canSort,
				enableHiding: canHide,
				enableGlobalFilter: canSearch,
				filterFn,
				meta: {
					label: col.name,
					export: col?.export
				},
				header: ({ column }) => {
					return renderComponent(ColumnHeader, {
						column,
						title: col.name
					});
				},
				cell: ({ row, column }) => {
					if (col.canFilter) {
						const rv = row.getValue(id);
						const current = this.facetedFilters[id].options;

						if (!current?.some((v) => v.value === rv))
							current?.push({
								label: rv as string,
								value: rv as string
							});
					}

					if (col.filter && col.filter?.map) {
						const rv = row.getValue(id);
						const current = this.facetedFilters[id].options;

						if (rv instanceof Array) {
							rv.forEach((entry) => {
								if (!current?.some((v) => v.value === entry)) {
									current?.push(col.filter!.map!(entry));
								}
							});
						} else {
							if (!current?.some((v) => v.value === rv)) {
								current?.push(col.filter!.map(rv));
							}
						}
					}

					if (col.component) {
						const comp = col.component({ row, column });
						return renderComponent(comp[0], comp[1] ?? undefined);
					}

					if (col.snippet) {
						const comp = col.snippet({ row, column });
						return renderSnippet(comp[0], comp[1] ?? undefined);
					}

					return renderSnippet(
						createRawSnippet<[string]>((getCol) => {
							return {
								render: () => `<div>${getCol()}</div>`
							};
						}),
						row.getValue(id) ?? '-'
					);
				}
			});
		}

		// The last item on the table header
		if (this.actions)
			this.definedColumns.push({
				id: 'actions',
				cell: ({ row }) =>
					renderComponent(RowActions, {
						row,
						data: this.data,
						actions: this.actions!,
						asBtn: this.actionsAsBtn ?? false
					})
			});
	}

	private makeTable(): Table<any> {
		let rowSelection = $state<RowSelectionState>({});
		let columnVisibility = $state<VisibilityState>({});
		let columnFilters = $state<ColumnFiltersState>([]);
		let globalFilters = $state('');
		let sorting = $state<SortingState>([]);
		let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });

		this.makeColumns();

		// Capture 'this' context properly
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const self = this;

		return createSvelteTable({
			get data() {
				return self.definedData;
			},
			columns: this.definedColumns,

			getCoreRowModel: getCoreRowModel(),
			getPaginationRowModel: getPaginationRowModel(),
			getSortedRowModel: getSortedRowModel(),
			getFilteredRowModel: getFilteredRowModel(),
			globalFilterFn: this.globalFilter,

			filterFns: {
				dateRange: dateRangeFilter
			},

			onPaginationChange: (updater) => {
				if (typeof updater === 'function') {
					pagination = updater(pagination);
				} else {
					pagination = updater;
				}
			},
			onSortingChange: (updater) =>
				(sorting = typeof updater === 'function' ? updater(sorting) : updater),
			onColumnFiltersChange: (updater) =>
				(columnFilters = typeof updater === 'function' ? updater(columnFilters) : updater),
			onGlobalFilterChange: (updater) =>
				(globalFilters = typeof updater === 'function' ? updater(globalFilters) : updater),
			onColumnVisibilityChange: (updater) =>
				(columnVisibility = typeof updater === 'function' ? updater(columnVisibility) : updater),
			onRowSelectionChange: (updater) =>
				(rowSelection = typeof updater === 'function' ? updater(rowSelection) : updater),

			state: {
				get pagination() {
					return pagination;
				},
				get sorting() {
					return sorting;
				},
				get columnFilters() {
					return columnFilters;
				},
				get columnVisibility() {
					return columnVisibility;
				},
				get rowSelection() {
					return rowSelection;
				},
				get globalFilter() {
					return globalFilters;
				}
			}
		});
	}

	public updateData(newData: TableData): void {
		this.data = newData;
		this.definedData = this.makeData();
	}
}
