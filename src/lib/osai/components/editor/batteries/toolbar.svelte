<script lang="ts">
	import { Separator } from '$lib/components/ui/separator';
	import {
		Bold,
		Italic,
		Redo,
		RemoveFormatting,
		Strikethrough,
		Underline,
		Undo
	} from '@lucide/svelte';
	import { type Snippet } from 'svelte';

	import type { Editor } from '@tiptap/core';
	import type { WeEditor } from '../core.svelte';
	import BubbleMenu from './utils/bubble-menu.svelte';
	import { TippyConfig } from './utils/tippy-config';
	import ToggleBtn from './utils/toggle-btn.svelte';

	export type ToolbarTool = Snippet<[{ id: string }]>;
	type MoreTools = {
		p1?: ToolbarTool[];
		p2?: ToolbarTool[];
		p3?: ToolbarTool[];
	};
	export type ToolbarProps = {
		editor: WeEditor | null;
		tools?: () => MoreTools;
	};

	let bubbleMenu = $state<HTMLElement | undefined>();
	let tippyRef = $state<TippyConfig>();

	let { editor, tools }: ToolbarProps = $props();

	let moreTools = $state<MoreTools>({});

	const useBubble = editor?.ext?.toolbar && editor.ext?.toolbar?.bubble;

	editor?.ready?.subscribe((v) => {
		if (!v) return;

		moreTools = tools ? tools() : {};

		tippyRef = new TippyConfig({
			editor: editor!,
			menu: bubbleMenu!
		});
	});

	export function scanner(editor: Editor) {
		if (!editor) return;

		tippyRef?.showOnSelection();
	}

	export const fixed: Snippet = fixedToolbar;
	export const separator: Snippet = slash;
</script>

{#snippet slash()}
	<Separator orientation="vertical" class="mx-1 h-5!" />
{/snippet}

{#snippet toolbar()}
	{#snippet toolLoop(toolBox: ToolbarTool[])}
		{#each toolBox as tool, i (i + (useBubble ? 'bubble' : 'fixed'))}
			{@const id = i + (useBubble ? 'bubble' : 'fixed')}

			{@render tool({ id })}
		{/each}
	{/snippet}
	<!-- P1 -->
	<ToggleBtn
		{editor}
		icon={Undo}
		title="Undo"
		onclick={() => editor?.chain().focus().undo().run()}
		disabled={() => !editor?.can().undo()}
	/>

	<ToggleBtn
		{editor}
		icon={Redo}
		title="Redo"
		onclick={() => editor?.chain().focus().redo().run()}
		disabled={() => !editor?.can().redo()}
	/>

	<ToggleBtn
		{editor}
		icon={RemoveFormatting}
		title="Clear All Formatting"
		onclick={() => editor?.chain().focus().unsetAllMarks().run()}
		disabled={() => !editor?.can().unsetAllMarks()}
	/>

	{#if moreTools && moreTools?.p1}
		{@render toolLoop(moreTools.p1)}
	{/if}
	{@render slash()}

	<!-- P2 -->
	<ToggleBtn
		{editor}
		icon={Bold}
		title="Bold"
		onclick={() => editor?.chain().focus().toggleBold().run()}
	/>
	<ToggleBtn
		{editor}
		icon={Italic}
		title="Italic"
		onclick={() => editor?.chain().focus().toggleItalic().run()}
	/>
	<ToggleBtn
		{editor}
		icon={Underline}
		title="Underline"
		onclick={() => editor?.chain().focus().toggleUnderline().run()}
	/>
	<ToggleBtn
		{editor}
		icon={Strikethrough}
		title="Strikethrough"
		id="strike"
		onclick={() => editor?.chain().focus().toggleStrike().run()}
	/>
	{#if moreTools?.p2}
		{@render toolLoop(moreTools.p2)}
	{/if}
	{@render slash()}

	{#if moreTools?.p3}
		{@render toolLoop(moreTools.p3)}
	{/if}
{/snippet}

{#if useBubble}
	<BubbleMenu bind:ref={bubbleMenu}>
		{@render toolbar()}
	</BubbleMenu>
{/if}

{#snippet fixedToolbar()}
	{#if !useBubble}
		<div
			class="sticky top-0 z-50 flex items-center gap-1 overflow-x-auto rounded-tl-lg rounded-tr-lg border bg-background px-2 py-1"
		>
			{@render toolbar()}
		</div>
	{/if}
{/snippet}
