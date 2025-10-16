import { PUBLIC_LOCALE } from '$env/static/public';
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date';

const loop = (
	obj: object | Array<any>,
	callback: (value: any, key: string | number) => any
): {
	length: number;
	output: any;
} => {
	const isInt = (str: any) => (isNaN(str) ? str : parseInt(str));

	let prop = {
		length: 0,
		output: null
	};

	for (let key in obj) {
		if (!obj.hasOwnProperty(key)) continue;
		key = isInt(key);

		// @ts-ignore
		const returnValue = callback(obj[key], key);

		if (returnValue === 'continue') continue;
		if (returnValue === 'break') break;

		prop.output = returnValue;
	}

	return prop;
};

const __debounceStore: Record<any, NodeJS.Timeout> = {};

export function debounce(
	fn: Function,
	interval: number,
	uniqueId: string | null = null
): Promise<any> {
	return new Promise((resolve, reject) => {
		let queued;
		const fnStr = uniqueId ?? fn.toString();

		loop(__debounceStore, (store, timeout) => {
			if (fnStr === store) {
				queued = timeout;
				return 'break';
			}
			queued = false;
		});

		if (queued) {
			clearTimeout(queued);
			delete __debounceStore[queued];
		}

		const timeout = setTimeout(() => {
			// @ts-expect-error
			delete __debounceStore[timeout];
			resolve(fn());
		}, interval);

		// @ts-expect-error
		__debounceStore[timeout] = fnStr;
	});
}

export function numberFormat(
	num: number,
	opt: Intl.NumberFormatOptions & {
		locale: 'en-NG' | 'en-US';
	} = { style: 'decimal', locale: 'en-NG', currency: 'NGN' }
) {
	return new Intl.NumberFormat(opt.locale, !opt.currency ? {} : opt).format(num ?? 0);
}

export function currency(num: number, { currency = 'NGN', locale = 'en-NG' }: any = {}) {
	return numberFormat(num, {
		style: 'currency',
		currency: currency,
		locale: locale
	});
}

export function dateF({ date, locale }: { date: string; locale?: string }): string {
	const [y, m, d] = date.split('-').map(Number);

	const df = new DateFormatter(locale ?? PUBLIC_LOCALE ?? 'en-NG', {
		dateStyle: 'medium'
	});

	return df.format(new CalendarDate(y, m, d).toDate(getLocalTimeZone()));
}

export function copy2Clipboard(
	content: string,
	opt?: {
		success?: (r: unknown) => void;
		error?: (e: unknown) => void;
		html?: boolean;
	}
) {
	const html = opt?.html ?? false;
	const success = opt?.success ?? ((r: unknown) => console.log('Copied to clipboard'));
	const error = opt?.error ?? ((r: unknown) => console.error('Failed to copy:', r));

	if (navigator.clipboard) {
		const mimeType = html ? 'text/html' : 'text/plain';

		navigator.clipboard
			.write([
				new ClipboardItem({
					[mimeType]: content
				})
			])
			.catch(error)
			.then(success);

		return true;
	}

	// For local environment only
	console.warn(
		`You are using a deprecated way to copy a string. Ensure this is a development environment`
	);

	const el = document.createElement('textarea');
	el.value = content;
	el.setAttribute('readonly', '');
	el.style.position = 'absolute';
	el.style.left = '-9999px';
	document.body.appendChild(el);
	el.select();

	try {
		document.execCommand('copy');
		success(false);
	} catch (e) {
		console.info(e);
		error(e);
	} finally {
		document.body.removeChild(el);
	}

	return true;
}
