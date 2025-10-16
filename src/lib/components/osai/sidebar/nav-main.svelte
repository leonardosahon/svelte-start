<script lang="ts">
	import { page } from '$app/state';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { cn } from '$lib/utils';
	import { ChevronRightIcon } from '@lucide/svelte';
	import type { NavItem, NavRoutes } from './types';

	const baseClass = 'cursor-pointer';

	let { routes }: { routes: NavRoutes } = $props();

	// per-item open state (keyed by url or title fallback)
	let open = $state<Record<string, boolean>>({});

	function keyFor(item: NavItem) {
		return item.url + item.title;
	}

	function isActive(href: string, alias?: string[]): boolean {
		if (page.url.pathname === href) return true;

		return alias?.includes(page.url.pathname) ?? false;
	}

	function makeActive(active: boolean) {
		return cn(
			baseClass,
			active
				? 'bg-primary/90 text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear'
				: ''
		);
	}

	// recursively check children for active route
	function hasActiveDescendant(item?: NavItem): boolean {
		if (!item?.sub?.length) return false;
		return item.sub.some((s) => isActive(s.url, s.alias) || hasActiveDescendant(s));
	}
</script>

{#snippet Item({ item, depth = 0 }: { item: NavItem; depth?: number })}
	{@const key = keyFor(item)}
	{@const active = isActive(item.url, item?.alias)}
	{@const hasSub = !!item.sub?.length}
	{@const expanded = active || hasActiveDescendant(item) || open[key]}

	<Collapsible.Root open={expanded}>
		{#snippet child({ props })}
			{#if depth === 0}
				<Sidebar.MenuItem {...props}>
					<Sidebar.MenuButton class={makeActive(active)} tooltipContent={item.title}>
						{#snippet child({ props })}
							<a
								href={item.url}
								{...props}
								onclick={(e) => {
									if (item.url === '#') {
										e.preventDefault();
										open[key] = !open[key];
									}
								}}
							>
								{#if item.icon}
									<item.icon />
								{/if}
								<span>{item.title}</span>
							</a>
						{/snippet}
					</Sidebar.MenuButton>

					{#if hasSub}
						<Collapsible.Trigger onclick={() => setTimeout(() => (open[key] = !open[key]))}>
							{#snippet child({ props })}
								<Sidebar.MenuAction
									{...props}
									class="top-[0px]! cursor-pointer px-4 data-[state=open]:rotate-90"
								>
									<ChevronRightIcon />
									<span class="sr-only">Toggle</span>
								</Sidebar.MenuAction>
							{/snippet}
						</Collapsible.Trigger>

						<Collapsible.Content>
							<Sidebar.MenuSub>
								{#each item.sub! as subItem (subItem.url ?? subItem.title)}
									{@render Item({ item: subItem, depth: depth + 1 })}
								{/each}
							</Sidebar.MenuSub>
						</Collapsible.Content>
					{/if}
				</Sidebar.MenuItem>
			{:else}
				<Sidebar.MenuSubItem>
					<Sidebar.MenuSubButton class={makeActive(active)}>
						{#snippet child({ props })}
							<a
								href={item.url}
								{...props}
								onclick={(e) => {
									if (item.url === '#') {
										e.preventDefault();
										open[key] = !open[key];
									}
								}}
							>
								<span>{item.title}</span>
							</a>
						{/snippet}
					</Sidebar.MenuSubButton>

					{#if hasSub}
						<Collapsible.Trigger onclick={() => setTimeout(() => (open[key] = !open[key]))}>
							{#snippet child({ props })}
								<Sidebar.MenuAction
									{...props}
									class="top-[0px]! cursor-pointer px-4 data-[state=open]:rotate-90"
								>
									<ChevronRightIcon />
									<span class="sr-only">Toggle</span>
								</Sidebar.MenuAction>
							{/snippet}
						</Collapsible.Trigger>

						<Collapsible.Content>
							<Sidebar.MenuSub>
								{#each item.sub! as subItem (subItem.url ?? subItem.title)}
									{@render Item({ item: subItem, depth: depth + 1 })}
								{/each}
							</Sidebar.MenuSub>
						</Collapsible.Content>
					{/if}
				</Sidebar.MenuSubItem>
			{/if}
		{/snippet}
	</Collapsible.Root>
{/snippet}

<Sidebar.Group>
	{#each routes as route (route.group)}
		<Sidebar.GroupLabel>{route.group}</Sidebar.GroupLabel>
		<Sidebar.Menu>
			{#each route.items as item (item.url ?? item.title)}
				{@render Item({ item })}
			{/each}
		</Sidebar.Menu>
	{/each}
</Sidebar.Group>
