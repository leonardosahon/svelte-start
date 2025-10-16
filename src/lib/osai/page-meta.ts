import { getContext, setContext } from 'svelte';
import { writable } from 'svelte/store';

const PAGE_CONTEXT_KEY = Symbol('page-og-metadata');

// OG Meta Data props.
// This will be populated with time
export interface PageContext {
	title: string;
	subtitle?: string;
	image?: string;
}

export function createMeta() {
	const store = writable<PageContext>({ title: '' });
	setContext(PAGE_CONTEXT_KEY, store);
	return store;
}

export function getMeta() {
	return getContext<ReturnType<typeof createMeta>>(PAGE_CONTEXT_KEY);
}
