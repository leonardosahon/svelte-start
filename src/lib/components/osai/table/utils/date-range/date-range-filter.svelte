<script lang="ts" generics="TData, TValue">
	import { Btn } from '$lib/components/osai/button';
	import { dateF } from '$lib/osai-std/operations';
	import { Badge } from '$lib/components/ui/badge';
	import * as Popover from '$lib/components/ui/popover';
	import { RangeCalendar } from '$lib/components/ui/range-calendar';
	import { Separator } from '$lib/components/ui/separator';
	import type { DateValue } from '@internationalized/date';
	import { CalendarIcon } from '@lucide/svelte';
	import type { Column } from '@tanstack/table-core';

	let {
		name,
		column
	}: {
		name: string;
		column: Column<TData, TValue>;
	} = $props();

	const start = undefined;
	const end = undefined;

	let open = $state(false);
	let value = $state<{
		start: DateValue | undefined;
		end: DateValue | undefined;
	}>({ start, end });
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		<Btn variant="outline" class="me-2 p-0 pe-0">
			<CalendarIcon />
			{name}
			{#if column?.getFilterValue() && value?.start && value?.end}
				<Separator orientation="vertical" class="h-4" />
				<Badge
					variant="secondary"
					class="rounded-sm px-1 font-normal"
					onclick={() => {
						column.setFilterValue(undefined);
					}}
				>
					{dateF({ date: value.start.toString() })}
					-
					{dateF({ date: value.end.toString() })}
				</Badge>
			{/if}
		</Btn>
	</Popover.Trigger>
	<Popover.Content class="w-auto overflow-hidden p-0" align="end">
		<RangeCalendar
			bind:value
			class="rounded-md border"
			onValueChange={(v) => {
				column.setFilterValue(v);
				if (v.start && v.end) open = false;
			}}
		/>
	</Popover.Content>
</Popover.Root>
