<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import { cn } from '$lib/utils';
	import { onMount } from 'svelte';
	import type { OptionField } from '../form-field-primitive.svelte';
	import type { FormUtils } from '../form-primitive.svelte';

	let {
		name,
		utils,
		type = 'single',
		class: className,
		label = '',
		options = [],
		selectedOptions = [],
		...restProps
	}: {
		utils: FormUtils;
		name: string;
		type?: 'single' | 'multiple';
		label?: string;
		class?: string;
		options?: Array<OptionField>;
		selectedOptions?: Array<OptionField>;
	} & {
		[attr: string]: any;
	} = $props();

	const form = utils.form;
	const { form: formData } = form;

	let selectedLabel = $state();
	let selectedIndex: number | null = $state(null);

	onMount(() => {
		onValueChange();
	});

	function onValueChange() {
		if (!$formData[name]) {
			selectedLabel = restProps.placeholder;
			return;
		}

		const selected = options.find((v, index: number) => {
			if (v.value === $formData[name]) {
				selectedIndex = index;
				return true;
			}
		});

		selectedLabel = selected?.label;
	}
</script>

<Select.Root
	{type}
	bind:value={$formData[name]}
	{name}
	required={restProps.required}
	onValueChange={(v: any) => {
		onValueChange();
		return restProps?.onChange?.(v, selectedIndex);
	}}
	allowDeselect
>
	<Select.Trigger
		class={cn(className, 'cursor-pointer')}
		{...restProps}
		aria-label={restProps.placeholder}
	>
		<div class="flex items-center">
			<!-- TODO: Add an icon here -->
			<div class="text-ellipsis">{selectedLabel ?? restProps.placeholder}</div>
		</div>
	</Select.Trigger>

	<Select.Content>
		{#each options as option, i (i + option.value!)}
			<Select.Item value={option.value!} label={option.label} />
		{/each}
	</Select.Content>
</Select.Root>
