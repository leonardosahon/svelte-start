<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { User } from '$lib/types';
	import { onMount, type ComponentProps } from 'svelte';
	import NavMain from './nav-main.svelte';
	import NavUser from './nav-user.svelte';
	import type { NavRoutes } from './types';

	let {
		routes,
		user,
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & {
		routes: NavRoutes;
		user: User;
	} = $props();

	const sidebar = Sidebar.useSidebar();
	let sidebarState = $derived(sidebar.state);

	// hydrate once from localStorage
	onMount(() => {
		const saved = localStorage.getItem('app_sb_st');
		sidebar.state = saved ?? 'expanded';

		//BUGFIX: We use this to fix an internal bug where sidebar doesn't know it is closed already on page load
		if (sidebar.state === 'collapsed') sidebar.toggle();
	});

	// keep sidebar and storage in sync
	$effect(() => {
		if (sidebarState) localStorage.setItem('app_sb_st', sidebarState);
	});
</script>

<Sidebar.Root
	collapsible="icon"
	variant="inset"
	class="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
	{...restProps}
>
	<Sidebar.Content>
		<NavMain {routes} />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser {user} />
	</Sidebar.Footer>
</Sidebar.Root>
