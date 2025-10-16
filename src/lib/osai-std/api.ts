import { browser } from '$app/environment';
import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { notify } from '$lib/components/osai/modal';

export type ApiResponse<TData = any, TMeta = any> = {
	status: string;
	message: string;
	data: TData;
	meta?: TMeta;
};

interface FetchOptions extends RequestInit {
	headers?: Record<string, string>;
}

export function errorMsg(msg: string) {
	return notify.error(msg, {
		duration: Number.POSITIVE_INFINITY,
		action: {
			label: 'Copy',
			onClick: () => navigator.clipboard.writeText(msg)
		}
	});
}

const baseUrl = PUBLIC_API_BASE_URL;

export class ApiStatic {
	static sessionExpiredHandler?: () => void;
}

function getCsrf(): string | undefined {
	if (!browser) return undefined;
	const cookie = document.cookie.split('; ').find((c) => c.startsWith('csrf_token='));
	return cookie?.split('=')[1];
}

async function apiFetch(
	endpoint: string,
	options: FetchOptions & {
		returnType?: 'json' | 'html' | 'text' | 'xml';
		isFile?: boolean;
	} = {}
): Promise<ApiResponse> {
	const csrf = getCsrf();
	const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
	const returnType = options.returnType ?? 'json';

	const defaultHeaders: Record<string, string> = options.isFile
		? {}
		: {
				'Content-Type': 'application/json'
			};
	if (csrf) defaultHeaders['X-CSRF-Token'] = csrf;

	if (options.body) {
		options.body = options.isFile ? options.body : JSON.stringify(options.body);
	}

	const config: RequestInit = {
		credentials: 'include',
		headers: {
			...defaultHeaders,
			...(options.headers || {})
		},
		...options
	};

	try {
		const response = await fetch(url, config);
		const contentType = response.headers.get('content-type');

		let data: any;

		if (returnType === 'json' || (contentType && contentType.includes('application/json'))) {
			data = await response.json();
		} else {
			data = await response.text();
		}

		if (response.ok) return data as ApiResponse;

		if (response.status === 909) {
			if (ApiStatic.sessionExpiredHandler) ApiStatic.sessionExpiredHandler();

			throw 'SESSION_EXPIRED';
		}

		const msg =
			typeof data === 'object' && data.message
				? data.message
				: `HTTP ${response.status}: ${response.statusText}`;

		if (data?.status === 'warning') {
			notify.multiline({
				type: 'warning',
				message: msg
			});

			throw 'SERVER_WARNING';
		}

		errorMsg(msg);
		throw 'SERVER_ERROR';
	} catch (error) {
		if (error instanceof SyntaxError) {
			const msg = `Tried to parse ${returnType} response but failed due to syntax error!`;

			errorMsg(msg);
			throw 'SERVER_ERROR';
		}

		throw error;
	}
}

export const api = {
	get: <T = any>(endpoint: string): Promise<ApiResponse<T>> =>
		apiFetch(endpoint, { method: 'GET' }),

	post: <T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> =>
		apiFetch(endpoint, {
			method: 'POST',
			body
		}),

	file: <T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> =>
		apiFetch(endpoint, {
			method: 'POST',
			body,
			isFile: true
		}),

	put: <T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> =>
		apiFetch(endpoint, {
			method: 'PUT',
			body
		}),

	patch: <T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> =>
		apiFetch(endpoint, {
			method: 'PATCH',
			body
		}),

	del: <T = any>(endpoint: string): Promise<ApiResponse<T>> =>
		apiFetch(endpoint, { method: 'DELETE' })
};
