<script lang="ts">
	import { TextAlignCenter, TextAlignEnd, TextAlignJustify, TextAlignStart } from '@lucide/svelte';
	import type { Editor } from '@tiptap/core';
	import TextAlign from '@tiptap/extension-text-align';
	import type { WeEditor } from '../core.svelte';
	import type { ToolbarTool } from './toolbar.svelte';
	import DropdownBtn, { type DropdownEntries } from './utils/dropdown-btn.svelte';

	let {
		editor
	}: {
		editor: WeEditor | null;
	} = $props();

	const entries: DropdownEntries = {
		left: {
			title: 'Align Left',
			icon: TextAlignStart,
			go: () => editor?.chain().focus().toggleTextAlign('left').run(),
			default: true
		},
		center: {
			title: 'Align Center',
			icon: TextAlignCenter,
			go: () => editor?.chain().focus().toggleTextAlign('center').run()
		},
		right: {
			title: 'Align Right',
			icon: TextAlignEnd,
			go: () => editor?.chain().focus().toggleTextAlign('right').run()
		},
		justify: {
			title: 'Justify',
			icon: TextAlignJustify,
			go: () => editor?.chain().focus().toggleTextAlign('justify').run()
		}
	};

	let activeState = $state(entries.left);
	let accentColor = $state('');

	editor?.ready?.subscribe((v) => {
		if (!v) return;

		accentColor = editor!.fresh!.accentColor();
	});

	export function scanner(editor: Editor) {
		activeState = entries.left;

		if (!editor.isActive({ textAlign: 'left' })) {
			let align = undefined;

			Object.entries(entries).find(([k, x]) => {
				if (editor.isActive({ textAlign: k })) {
					align = x;
					return true;
				}

				return false;
			});

			activeState = align ?? entries.left;
		}
	}
	export function config() {
		return TextAlign.configure({
			types: ['heading', 'paragraph']
		});
	}

	export const toolbar: ToolbarTool = toolbarBtn;
</script>

{#snippet toolbarBtn()}
	<DropdownBtn {accentColor} title={'List Items'} {entries} activeState={() => activeState} />
{/snippet}
