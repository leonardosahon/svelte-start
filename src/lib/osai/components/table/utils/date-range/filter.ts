/* eslint-disable @typescript-eslint/no-explicit-any */
import { CalendarDate, getLocalTimeZone, parseZonedDateTime } from '@internationalized/date';
import type { FilterFn, Row } from '@tanstack/table-core';

export type DateRangeFilterValue = {
	start?: Date | string | number | null;
	end?: Date | string | number | null;
};

function normalizeToISO(str: string) {
	const [date, time, zone] = str.split(' ');
	return `${date}T${time}[${zone}]`;
}

function toTimestamp(val: any): number | null {
	if (val == null || val === '') return null;

	if (typeof val === 'number') return val;

	// Date object
	if (val instanceof Date && !isNaN(val.getTime())) return val.getTime();

	if (val instanceof CalendarDate) return val.toDate(getLocalTimeZone()).getTime();

	try {
		const zoned = parseZonedDateTime(normalizeToISO(val));

		if (zoned) {
			const jsDate = zoned.toDate();

			return jsDate.getTime();
		}
	} catch (e) {}

	// ISO string or other date-string
	const d = new Date(val);
	if (!isNaN(d.getTime())) return d.getTime();

	return null;
}

export const dateRangeFilter: FilterFn<any> = (
	row: Row<any>,
	columnId: string,
	filterValue: DateRangeFilterValue
) => {
	if (!filterValue) return true; // no filter -> pass

	const startTs = toTimestamp(filterValue.start);
	const endTs = toTimestamp(filterValue.end);

	// if neither bound provided, don't filter
	if (startTs == null && endTs == null) return true;

	const cell = row.original[columnId];
	const cellTs = toTimestamp(cell);

	if (cellTs == null) return false;

	// if only start provided
	if (startTs != null && endTs == null) return cellTs >= startTs;

	// if only end provided
	if (startTs == null && endTs != null) return cellTs <= endTs;

	// both bounds
	return cellTs >= startTs! && cellTs <= endTs!;
};
