<script lang="ts">
	import { Btn } from '$lib/osai/components/button';
	import type { Snippet } from 'svelte';
	import SuperDebug, {
		defaults,
		setMessage,
		type SuperForm,
		superForm,
		type SuperValidated
	} from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { z, type ZodObject } from 'zod';

	export type FormUtils = {
		form: SuperForm<any>;
		schema: ZodObject<any>;
		loading: boolean;
		asterisx: boolean;
	};

	export type FormDataObj = { [key: string]: any };
	export type FormSubmit = (data: FormDataObj, form: SuperValidated<any>) => void;

	let {
		schema = z.object({}),
		loading = false,
		loadingText = 'Loading...',
		submitText = 'Submit',
		submit = $bindable(),
		class: className = '',
		fields,
		header,
		footer,
		asterix = true,
		debug = false,
		hideSubmit = false,
		utils = $bindable()
	}: {
		schema?: ZodObject<any>;
		fields: (utils: FormUtils) => any;
		class?: string;
		submit: FormSubmit;
		submitText?: string;
		hideSubmit?: boolean;
		header?: Snippet;
		footer?: Snippet;
		loading?: boolean;
		loadingText?: string;
		asterix?: boolean;
		debug?: boolean;
		utils?: FormUtils;
	} = $props();

	//@ts-ignore
	const sForm = superForm(defaults(zodClient(schema)), {
		SPA: true,
		//@ts-ignore
		validators: zodClient(schema),
		resetForm: false,
		onUpdate: ({ form }) => {
			if (form.valid) {
				const newForm = deepify(form.data);
				submit(newForm, form);
				return form;
			}

			setMessage(form, 'Form validation failed');
		}
	});

	const { enhance, form: formData } = sForm;

	utils = {
		form: sForm,
		schema,
		loading,
		asterisx: asterix
	};

	// Convert formdata[a][a] to formData = { a: {b: value}}
	function deepify(flat: Record<string, any>) {
		const result: any = {};

		for (const [path, value] of Object.entries(flat)) {
			if (!path.includes('[')) {
				result[path] = value;
				continue;
			}

			let keys = path.replace(/\]/g, '').split('[');
			let lastKey = keys.pop()!;
			let cur = result;

			for (let key of keys) {
				if (!(key in cur)) cur[key] = {};
				cur = cur[key];
			}
			cur[lastKey] = value;
		}

		return result;
	}
</script>

{#if debug}
	<div class="mb-4 overflow-auto">
		<SuperDebug data={deepify($formData)} />
	</div>
{/if}

<form use:enhance class={className}>
	{@render header?.()}

	{@render fields(utils)}

	<Btn {loading} class="w-full {hideSubmit ? 'hidden' : ''}" {loadingText}>{submitText}</Btn>

	{@render footer?.()}
</form>
