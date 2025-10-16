<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { EllipsisIcon } from '@lucide/svelte';
	import type { Row } from '@tanstack/table-core';
	import { Btn } from '../../button';
	import type { TableActions, TableData } from './types';

	let {
		actions,
		data,
		row,
		asBtn
	}: {
		actions: TableActions;
		data: TableData;
		row: Row<any>;
		asBtn: boolean;
	} = $props();
</script>

{#if asBtn}
	{#each actions(data.list[row.original.index], row.original) as action}
		{@const restProps = () => {
			let x = action;
			delete x.sub;
			return x;
		}}
		{@const iconOnly = action.iconOnly}

		<div title={action.title} {...restProps()}>
			{#if action.icon}
				{@const { component: Comp, props, snippet } = action.icon}
				{#if Comp}
					<Comp {...props} />
				{:else if snippet}
					{@render snippet(props ?? {})}
				{/if}
			{/if}

			<span class={iconOnly ? 'sr-only' : ''}>{action.title}</span>
		</div>
	{/each}
{:else}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			{#snippet child({ props })}
				<Btn {...props} variant="ghost" class="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
					<EllipsisIcon />
					<span class="sr-only">Open Menu</span>
				</Btn>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content class="w-[160px]" align="end">
			{#each actions(data.list[row.original.index], row.original) as action}
				{@const restProps = () => {
					let x = action;
					delete x.sub;
					return x;
				}}

				{#if action.sub}
					<DropdownMenu.Sub>
						<DropdownMenu.SubTrigger>{action.title}</DropdownMenu.SubTrigger>
						<DropdownMenu.SubContent>
							{#each action.sub as sub}
								{@const subRestProps = () => {
									let x = action;
									return x;
								}}
							{/each}
							... Add impl for sub content
						</DropdownMenu.SubContent>
					</DropdownMenu.Sub>
				{:else if action.title}
					<DropdownMenu.Item {...restProps()}>{action.title}</DropdownMenu.Item>
				{:else}
					<DropdownMenu.Separator />
				{/if}
			{/each}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/if}
