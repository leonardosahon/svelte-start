<script lang="ts">
	import { Code, SquareCode } from '@lucide/svelte';
	import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
	import { all, createLowlight } from 'lowlight';
	import type { WeEditor } from '../core.svelte';
	import type { ToolbarTool } from './toolbar.svelte';
	import ToggleBtn from './utils/toggle-btn.svelte';

	let { editor }: { editor: WeEditor | null } = $props();

	// create a lowlight instance with all languages loaded
	const lowlight = createLowlight(all);

	export function slashCommands() {
		return {
			code: {
				title: 'Code Block',
				icon: Code,
				go: () => editor?.chain().focus().toggleCodeBlock().run(),
				keywords: ['code', 'codeblock']
			}
		};
	}

	export function config() {
		return CodeBlockLowlight.configure({
			lowlight,
			enableTabIndentation: true,
			tabSize: 2,
			languageClassPrefix: 'language-'
		});
	}

	export const code: ToolbarTool = codeBtn;
	export const codeBlock: ToolbarTool = codeBlockBtn;
</script>

{#snippet codeBtn()}
	<ToggleBtn
		{editor}
		icon={Code}
		title="Code Snippet"
		id="code"
		onclick={() => editor?.chain().focus().toggleCode().run()}
	/>
{/snippet}

{#snippet codeBlockBtn()}
	<ToggleBtn
		{editor}
		icon={SquareCode}
		title="Code Block"
		id="codeBlock"
		onclick={() => editor?.chain().focus().toggleCodeBlock().run()}
	/>
{/snippet}
