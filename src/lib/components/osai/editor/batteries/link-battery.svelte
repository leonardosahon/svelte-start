<script lang="ts">
	import { Link, Unlink2 } from '@lucide/svelte';
	import type { StarterKitOptions } from '@tiptap/starter-kit';
	import type { Snippet } from 'svelte';
	import { Btn } from '../../button';
	import { Form, FormField } from '../../form';
	import type { FormDataObj, FormUtils } from '../../form/form-primitive.svelte';
	import { Modal } from '../../modal';
	import type { WeEditor } from '../core.svelte';
	import ToggleBtn from './utils/toggle-btn.svelte';

	let {
		editor
	}: {
		editor: WeEditor | null;
	} = $props();

	let linkModalOpened = $state(false);
	let linkFormUtils: FormUtils | undefined = $state();
	let activeLink = $state<{
		href?: string;
		target?: string;
		rel?: string;
		class?: string;
	}>({});

	export const action = {
		open: () => {
			linkModalOpened = true;
		},
		canOpen: () => editor?.can().setLink({ href: '' }),
		unlink: () => {
			editor?.chain().focus().unsetLink().focus().run();
			linkModalOpened = false;
		},
		submit: (formData: FormDataObj) => {
			editor
				?.chain()
				.focus()
				.setLink({
					href: formData.link,
					target: formData.target ?? '_blank',
					rel: formData.rel,
					class: formData.class
				})
				.focus()
				.run();

			linkModalOpened = false;
		},
		targets: [
			{ label: 'New Tab', value: '_blank' },
			{ label: 'Same Window', value: '_self' },
			{ label: 'Parent Tab', value: '_parent' },
			{ label: 'Topmost Window', value: '_top' }
		]
	};

	export function config(): StarterKitOptions['link'] {
		return {
			openOnClick: false,
			linkOnPaste: true,
			autolink: true,
			defaultProtocol: 'https',
			protocols: ['tel', 'mailto']
		};
	}

	export function scanner(editor: WeEditor) {
		const link = editor.getAttributes('link');
		if (link) activeLink = link;
	}

	export const toolbar: Snippet = toolbarBtn;
</script>

{#snippet toolbarBtn()}
	<ToggleBtn
		{editor}
		icon={Link}
		title="Link Selection"
		isActive={() => {
			return activeLink.href !== undefined && activeLink.href !== null;
		}}
		onclick={() => action.open()}
	/>
{/snippet}

<Modal title="Link Selection" bind:open={linkModalOpened}>
	<Form bind:utils={linkFormUtils} submit={action.submit} hideSubmit>
		{#snippet fields(utils)}
			<FormField
				{utils}
				label="Link"
				placeholder="Website/email/tel link"
				name="link"
				value={activeLink?.href}
				required
			/>
			<FormField
				{utils}
				label="Target"
				description="How should the link be opened? 'New Tab' is the default"
				type="select"
				name="target"
				value={activeLink?.target ?? '_blank'}
				options={action.targets}
			/>
			<FormField
				{utils}
				label="Link Relationship"
				description="You can specify how the browsers should interpret the relationship between this link and your current page. Ignore it if you don't understand"
				value={activeLink?.rel ?? 'noopener'}
				name="rel"
			/>
			<FormField
				{utils}
				label="HTML Class"
				description="You can add html class names to your link for future reference"
				name="class"
				value={activeLink?.class}
			/>
		{/snippet}
	</Form>

	{#snippet footer()}
		<div class="flex gap-2">
			{#if activeLink?.href}
				<Btn class="flex-1" variant="destructive" onclick={action.unlink}><Unlink2 /> Unlink</Btn>
			{/if}

			<Btn class="flex-1" onclick={linkFormUtils?.form.submit}>Link</Btn>
		</div>
	{/snippet}
</Modal>
