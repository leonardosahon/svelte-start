<script lang="ts">
	import { PUBLIC_LOCALE } from '$env/static/public';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Select from '$lib/components/ui/select/index.js';

	import { buttonVariants } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { cn } from '$lib/utils';
	import {
		CalendarDate,
		DateFormatter,
		type DateValue,
		getLocalTimeZone,
		today
	} from '@internationalized/date';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import { Btn } from '../../button';

	let dateValue: DateValue | undefined = $state();
	let open = $state(false);

	let {
		value = $bindable(),
		minDate,
		dateEditable = false,
		required
	}: {
		value?: string;
		type?: 'single' | 'multiple';
		dateEditable?: boolean;
		required?: boolean;
		minDate?: {
			year: number;
			month: number;
			day: number;
		};
	} = $props();

	const items = [
		{ value: 0, label: 'Today' },
		{ value: 1, label: 'Tomorrow' },
		{ value: 3, label: 'In 3 days' },
		{ value: 7, label: 'In a week' }
	];

	if (value) dateValue = str2Date(value);

	const valueString = $derived(dateValue ? date2Str(dateValue) : '');

	function str2Date(date: string | undefined) {
		if (!date) return;

		const [y, m, d] = date.split('-').map(Number);
		return new CalendarDate(y, m, d);
	}

	function date2Str(date: DateValue | undefined) {
		if (!date) return;

		const df = new DateFormatter(PUBLIC_LOCALE ?? 'en-NG', {
			dateStyle: 'long'
		});

		return df.format(date.toDate(getLocalTimeZone()));
	}

	function format(v: DateValue | undefined) {
		if (!v) return;

		return v.year + '-' + ('' + v.month).padStart(2, '0') + '-' + ('' + v.day).padStart(2, '0');
	}

	function isValidDate(date: Date | undefined): date is Date {
		if (!date) return false;
		return !isNaN(date.getTime());
	}
</script>

<div class="relative flex gap-2">
	{#if dateEditable}
		<Input
			placeholder="YYYY-MM-DD"
			class="bg-background pr-10"
			{required}
			bind:value={
				() => value,
				(v: any) => {
					const date = new Date(v);
					value = v;
					if (isValidDate(date)) {
						dateValue = str2Date(v);
					}
				}
			}
			onkeydown={(e: KeyboardEvent) => {
				if (e.key === 'ArrowDown') {
					e.preventDefault();
					open = true;
				}
			}}
		/>
	{:else}
		<input
			bind:value
			type="text"
			tabindex="-1"
			class="sr-only"
			name={'DATE_PICKER::' + Math.random()}
			{required}
		/>
	{/if}
	<Popover.Root bind:open>
		{#if dateEditable}
			<Popover.Trigger>
				{#snippet child({ props })}
					<Btn {...props} variant="ghost" class="absolute top-1/2 right-2 size-6 -translate-y-1/2">
						<CalendarIcon class="size-3.5" />
						<span class="sr-only">Select date</span>
					</Btn>
				{/snippet}
			</Popover.Trigger>
		{:else}
			<Popover.Trigger
				class={cn(
					buttonVariants({
						variant: 'outline',
						class: 'w-full cursor-pointer justify-start text-left font-normal'
					}),
					!dateValue && 'text-muted-foreground'
				)}
			>
				<CalendarIcon class="mr-2 size-4" />
				{dateValue ? date2Str(dateValue) : 'Pick a date'}
			</Popover.Trigger>
		{/if}
		<Popover.Content
			class="flex w-auto flex-col space-y-2 overflow-hidden p-0 p-2"
			align="end"
			alignOffset={-8}
			sideOffset={10}
		>
			<Select.Root
				type="single"
				bind:value={
					() => valueString,
					(v) => {
						if (!v) return;
						dateValue = today(getLocalTimeZone()).add({
							days: Number.parseInt(v)
						});
					}
				}
				onValueChange={() => (open = false)}
			>
				<Select.Trigger>
					{valueString}
				</Select.Trigger>
				<Select.Content>
					{#each items as item (item.value)}
						<Select.Item value={`${item.value}`}>{item.label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>

			<div class="rounded-md border">
				<Calendar
					type="single"
					minValue={minDate
						? new CalendarDate(minDate?.year, minDate?.month, minDate?.day)
						: undefined}
					captionLayout="dropdown-years"
					bind:value={dateValue}
					onValueChange={(v?: DateValue) => {
						value = format(v);
						open = false;
					}}
				/>
			</div>
		</Popover.Content>
	</Popover.Root>
</div>
