<script lang="ts">
	import { Heading1, Heading2, Heading3, Pilcrow } from '@lucide/svelte';
	import type { Editor } from '@tiptap/core';
	import type { StarterKitOptions } from '@tiptap/starter-kit';
	import type { WeEditor } from '../core.svelte';
	import type { ToolbarTool } from './toolbar.svelte';
	import DropdownBtn, { type DropdownEntries } from './utils/dropdown-btn.svelte';

	let {
		editor
	}: {
		editor: WeEditor | null;
	} = $props();

	let accentColor = $state('');

	editor?.ready?.subscribe((v) => {
		if (!v) return;

		accentColor = editor!.fresh!.accentColor();
	});

	const entries: DropdownEntries = {
		h1: {
			title: 'Heading 1',
			icon: Heading1,
			go: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
			keywords: ['h1', 'heading', 'title']
		},
		h2: {
			title: 'Heading 2',
			icon: Heading2,
			go: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
			keywords: ['h2', 'heading', 'subtitle']
		},
		h3: {
			title: 'Heading 3',
			icon: Heading3,
			go: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
			keywords: ['h3', 'heading']
		},
		p: {
			title: 'Paragraph',
			icon: Pilcrow,
			go: () => editor?.chain().focus().setParagraph().run(),
			default: true
		}
	};

	let activeState = $state(entries.p);

	export function config(): StarterKitOptions['heading'] {
		return (
			editor?.ext?.heading ?? {
				levels: [1, 2, 3]
			}
		);
	}

	export function scanner(editor: Editor) {
		const heading = editor.getAttributes('heading');

		if (heading.level) activeState = entries['h' + heading.level];
		else activeState = entries.p;
	}

	export function slashCommands() {
		return entries;
	}

	export const toolbar: ToolbarTool = toolbarBtn;
</script>

{#snippet toolbarBtn()}
	<DropdownBtn {accentColor} title={'Heading Levels'} {entries} activeState={() => activeState} />
{/snippet}
