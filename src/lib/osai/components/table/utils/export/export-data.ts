import type { Table } from '@tanstack/table-core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function getTableData<TData>(table: Table<TData>): string[][] {
	let headers = [];

	for (let col of table.getAllLeafColumns()) {
		if (!(col.columnDef.meta as any)?.label || !col.getIsVisible()) continue;
		headers.push((col.columnDef.meta as any).label);
	}

	let rows = [];

	for (let row of table.getRowModel().rows) {
		let x = [];

		for (let cell of row.getVisibleCells()) {
			if (cell.column.id === 'actions') continue;

			const meta = cell.column.columnDef.meta as any;
			const value = cell.getValue();

			if (meta?.export && typeof meta.export === 'function') {
				x.push(meta.export(value));
				continue;
			}

			if (typeof value === 'object' && value !== null) {
				x.push(JSON.stringify(value));
				continue;
			}

			x.push(value ?? '');
		}

		rows.push(x);
	}

	return [headers, ...rows];
}

export function exportCSV<TData>(table: Table<TData>, filename = 'table') {
	const data = getTableData(table);
	const csv = data.map((row) => row.map((v) => `"${v}"`).join(',')).join('\n');

	downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;');
}

export function exportExcel<TData>(table: Table<TData>, filename = 'table') {
	const data = getTableData(table);
	const tsv = data.map((row) => row.map((v) => `"${v}"`).join('\t')).join('\n');

	downloadFile(tsv, `${filename}.xls`, 'application/vnd.ms-excel;charset=utf-8;');
}

export function exportText<TData>(table: Table<TData>, filename = 'table') {
	const data = getTableData(table);
	const text = data.map((row) => row.join('\t')).join('\n');

	downloadFile(text, `${filename}.txt`, 'text/plain;charset=utf-8;');
}

export function exportPdf<TData>(table: Table<TData>, filename = 'table') {
	const data = getTableData(table);
	const [headers, ...rows] = data;

	const doc = new jsPDF();

	autoTable(doc, {
		head: [headers],
		body: rows
	});

	doc.save(`${filename}.pdf`);
}

function downloadFile(content: string, filename: string, mime: string) {
	const blob = new Blob([content], { type: mime });
	const url = URL.createObjectURL(blob);

	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();

	URL.revokeObjectURL(url);
}
