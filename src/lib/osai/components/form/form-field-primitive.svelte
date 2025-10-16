<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Control, Field, FieldErrors, Label } from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { cn } from '$lib/utils';
	import { Eye, EyeOff, Info } from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { FormUtils } from './form-primitive.svelte';
	import DatePicker from './inputs/date-picker.svelte';
	import Select from './inputs/select.svelte';

	type FormFieldAttributes =
		| HTMLAttributes<HTMLInputElement>
		| HTMLAttributes<HTMLTextAreaElement>
		| HTMLAttributes<HTMLSelectElement>;

	export type OptionField = {
		label: string | undefined;
		value: string | undefined;
		icon?: any;
		iconProps?: any;
	};

	let {
		name,
		utils,
		class: className,
		value,
		type = 'text',
		label,
		labelSnippet,
		options = [],
		selectedOptions = [],
		description,
		disabled,
		dateEditable,
		...restProps
	}: {
		value?: any;
		label?: string;
		labelSnippet?: Snippet<any>;
		description?: string;
		class?: string;
		dateEditable?: boolean;
		utils: FormUtils;
		options?: Array<OptionField>;
		selectedOptions?: Array<OptionField>;
	} & FormFieldAttributes & {
			[attr: string]: any;
		} = $props();

	let showPassword = $state(false);
	let checkedOne: string | null = $state(null);
	let openTooltip = $state(false);

	const isPasswordType = type === 'password';
	const inputType = $derived(isPasswordType ? (showPassword ? 'text' : 'password') : type);

	function togglePasswordVisibility() {
		showPassword = !showPassword;
	}

	const baseClass = 'w-full';
	const isCheckbox = type === 'checkbox';

	const form = utils.form;
	const { form: formData } = form;

	const zod = utils.schema.shape[name];

	const required = restProps.required ?? zod?.minLength > 0;
	disabled = disabled ?? utils.loading;

	if (value && !isCheckbox) $formData[name] = value;

	let multiple = false;

	if (isCheckbox) {
		multiple = options.length > 0;

		if (selectedOptions.length > 0) {
			checkedOne = 'yes';
			$formData[name] = selectedOptions.map((v) => v.value);
		}
	}

	function addItem(value: any) {
		value = value ?? true;

		if (!multiple) {
			$formData[name] = value;
			return;
		}

		$formData[name] = [...($formData[name] ?? []), value];

		if (isCheckbox) checkedOne = 'yes';
	}

	function removeItem(value: any) {
		if (!multiple) {
			$formData[name] = null;
			return;
		}

		$formData[name] = $formData[name].filter((i: string) => i !== value);

		if ($formData[name].length === 0 && isCheckbox) checkedOne = null;
	}

	function submitOnEnter(e: KeyboardEvent) {
		if (e.code === 'Enter') form.submit();
	}
</script>

{#snippet field({
	label,
	labelSnippet,
	value,
	required,
	checked
}: {
	label?: string;
	labelSnippet?: any;
	value?: string;
	required: boolean;
	checked?: boolean;
})}
	{#snippet ls({ id }: { id: string })}
		{@render labelSnippet({
			required,
			asterisx: utils.asterisx,
			description,
			forId: id
		})}
	{/snippet}

	<Field {form} {name}>
		<Control>
			{#snippet children({ props })}
				{@const finalProps : any = () => {
                    const x : any = { disabled, ...props, ...restProps };
                    delete x.selectedOptions;

                    if(isCheckbox && multiple) delete x.required;

                    x.placeholder = x.placeholder ?? label;

                    if(labelSnippet)
                      x.id = name + "id";

                    return x;
                }}

				{#if labelSnippet}
					{@render ls({ id: finalProps().id })}
				{:else if label && !isCheckbox}
					<Label class="align-items-center gap-1">
						{label}

						{#if description}
							<Tooltip.Provider>
								<Tooltip.Root open={openTooltip}>
									<Tooltip.Trigger
										onclick={() => (openTooltip = !openTooltip)}
										class={cn(
											buttonVariants({
												variant: 'ghost'
											}),
											'h-3 w-3 cursor-help'
										)}
									>
										<Info />
									</Tooltip.Trigger>
									<Tooltip.Content>
										<p>{description}</p>
									</Tooltip.Content>
								</Tooltip.Root>
							</Tooltip.Provider>
						{/if}

						{#if required && utils.asterisx}
							<span class="text-destructive">*</span>
						{/if}
					</Label>
				{/if}

				<div class="relative">
					{#if type === 'textarea'}
						<Textarea bind:value={$formData[name]} class={className} {...finalProps()} />
					{:else if type === 'select'}
						<Select
							{name}
							{required}
							{utils}
							{label}
							{options}
							{selectedOptions}
							class={cn(className, baseClass)}
							{...finalProps()}
						/>
					{:else if type === 'date'}
						<DatePicker
							bind:value={$formData[name]}
							class={cn(className, baseClass)}
							{required}
							{dateEditable}
							{...finalProps()}
						/>
					{:else if isCheckbox}
						<div class={cn('flex flex-wrap gap-1', className)}>
							<Checkbox
								onCheckedChange={(v) => (v ? addItem(value) : removeItem(value))}
								{...finalProps()}
								onkeyup={submitOnEnter}
								{checked}
							/>

							{#if label}
								<Label>{label}</Label>
							{:else if labelSnippet}
								{@render ls({ id: finalProps().id })}
							{/if}
						</div>
					{:else}
						<Input
							type={inputType}
							bind:value={$formData[name]}
							class={className}
							{...finalProps()}
						/>

						{#if isPasswordType}
							<button
								type="button"
								class="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
								onclick={togglePasswordVisibility}
								aria-label={showPassword ? 'Hide password' : 'Show password'}
							>
								{#if showPassword}
									<Eye class="h-4 w-4" />
								{:else}
									<EyeOff class="h-4 w-4" />
								{/if}
							</button>
						{/if}
					{/if}
				</div>
			{/snippet}
		</Control>
		<FieldErrors />
	</Field>
{/snippet}

<div class="mb-4 space-y-2">
	{#if isCheckbox}
		{#if options.length > 0}
			{#each options as option}
				{@const checked =
					selectedOptions.length > 0 && selectedOptions.some((v) => v.value === option.value)}

				{@render field({
					label: option.label,
					value: option.value,
					required: false,
					checked: checked
				})}
			{/each}
			<input
				bind:value={checkedOne}
				type="text"
				tabindex="-1"
				class="sr-only"
				name={'GROUP_CHECK::' + name}
				{required}
			/>
		{:else if label || value}
			{@render field({ label, value, required })}
		{/if}
	{:else}
		{@render field({ label, value, required, labelSnippet })}
	{/if}
</div>
