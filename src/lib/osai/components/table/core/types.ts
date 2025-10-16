/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Column, Row, RowData } from '@tanstack/table-core';
import type { Component, Snippet } from 'svelte';
import type { DateRangeFilterValue } from '../utils/date-range/filter';

export interface TableData<TData extends RowData = any, T = any> {
	list: T[];
	map: (obj: T, index: number) => TData;
}

type Filter<T> =
	| {
			fn?: (row: Row<T>, id: string, value: any) => any;
			map: (obj: T) => TableFilterOption;
			options?: never;
			lateOptions?: never;
			source?: never;
	  }
	| {
			fn?: (row: Row<T>, id: string, value: any) => any;
			map?: never;
			options: TableFilterOption[];
			lateOptions?: never;
			source?: never;
	  }
	| {
			fn?: (row: Row<T>, id: string, value: any) => any;
			map?: never;
			options?: never;
			lateOptions: (obj: T) => TableFilterOption[];
			source: () => T;
	  };

export type TableColumns<T = any> = {
	name: string;
	id?: string;
	export?: (value: any) => string;
	filter?: Filter<T>;
	dateRange?: (row: Row<T>, id: string, value: DateRangeFilterValue) => any;
	canDateRange?: boolean;
	canFilter?: boolean;
	canSort?: boolean;
	canHide?: boolean;
	canSearch?: boolean;
	component?: ({ row, column }: { row: Row<T>; column: Column<T> }) => [Component<any>, object?];
	snippet?: ({ row, column }: { row: Row<T>; column: Column<T> }) => [Snippet, object?];
}[];

export type TableActions<T = any> = (
	dataList: T,
	rowData: Row<T>
) => {
	title?: string;
	class?: string;
	onclick?: (e?: Event) => void;
	icon?: {
		component?: Component;
		snippet?: Snippet<[object]>;
		props?: object;
	};
	iconOnly?: boolean;
	sub?: any;
}[];

type TableFilter = {
	id: string;
	title?: string;
	options: TableFilterOption[];
};

export type TableFilters = TableFilter[];
export type TableFiltersObject = { [key: string]: TableFilter };

export type TableFilterOption = {
	label: string;
	value: string;
	icon?: Component;
};
