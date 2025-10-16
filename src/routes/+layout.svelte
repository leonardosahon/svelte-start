<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { errorMsg } from '$lib/osai/api';
	import { AlertContainer, notify, Toaster } from '$lib/osai/components/modal';
	// import { ROUTES } from '$lib/routes';
	import {
		MutationCache,
		QueryCache,
		QueryClient,
		QueryClientProvider
	} from '@tanstack/svelte-query';
	import { ModeWatcher } from 'mode-watcher';
	import '../app.css';
	import { createMeta } from '$lib/osai/page-meta';

	let { children } = $props();
	let Devtools: any = $state();
	const pageMeta = createMeta();

	if (import.meta.env.DEV && browser) {
		import('@tanstack/svelte-query-devtools').then((mod) => {
			Devtools = mod.SvelteQueryDevtools;
		});
	}

	function errorHandlers(error: any) {
		if (error === 'SERVER_WARNING' || error === 'SERVER_ERROR') return;

		if (error === 'SESSION_EXPIRED') {
			notify.warning('Your session expired. Please log in again.', { id: 'session-exp-toast' });
			// setTimeout(() => goto(ROUTES.login), 1000);
			return;
		}

		errorMsg('Client Error: Please refresh your browser and try again, or try in another browser');

		console.error(error);
		throw 'Uncaught Error!';
	}

	const queryClient = new QueryClient({
		queryCache: new QueryCache({
			onError: errorHandlers
		}),
		mutationCache: new MutationCache({
			onError: errorHandlers
		}),
		defaultOptions: {
			queries: {
				enabled: browser,
				refetchOnWindowFocus: false, // avoid noisy reloads
				retry: 1 // retry once before failing
			}
		}
	});

	// Make notifier disappear on change of route
	// $effect(() => {
	// 	page.url.pathname;
	// 	// notify.dismiss();
	// 	// console.log('here');
	// });
</script>

<svelte:head>
	<title>{$pageMeta?.title}</title>
	<meta name="description" content={$pageMeta?.subtitle ?? ''} />
</svelte:head>

<Toaster richColors closeButton position="top-center" class="pointer-events-auto" />

<AlertContainer />

<ModeWatcher />

<QueryClientProvider client={queryClient}>
	<header class="sticky top-0 z-50 flex w-full items-center border-b bg-background">
		<div class="flex h-(--header-height) w-full items-center gap-2 px-4">
			<a class="mr-4 flex gap-3" href="/">
				<div
					class="flex aspect-square size-10 items-center justify-center rounded-lg text-sidebar-primary-foreground"
				>
					<img class="size-10 rounded-lg" src="/favicon.svg" alt="Fav" />
				</div>
			</a>

			<h1 class="font-normal text-foreground">{$pageMeta?.title ?? ''}</h1>
		</div>
	</header>

	{@render children?.()}

	{#if Devtools}
		<Devtools />
	{/if}
</QueryClientProvider>
