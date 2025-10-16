<script module>
	import type { BubbleMenuOptions } from '@tiptap/extension-bubble-menu';
	import type { CodeBlockLowlightOptions } from '@tiptap/extension-code-block-lowlight';
	import type { HighlightOptions } from '@tiptap/extension-highlight';
	import type { ImageOptions } from '@tiptap/extension-image';
	import type { BulletListOptions, TaskItemOptions, TaskListOptions } from '@tiptap/extension-list';
	import type { SubscriptExtensionOptions } from '@tiptap/extension-subscript';
	import type { SuperscriptExtensionOptions } from '@tiptap/extension-superscript';
	import type { TableKitOptions } from '@tiptap/extension-table';
	import type { TableOfContentsOptions } from '@tiptap/extension-table-of-contents';
	import type { TextAlignOptions } from '@tiptap/extension-text-align';
	import type { FontFamilyOptions, FontSizeOptions } from '@tiptap/extension-text-style';
	import { Node } from '@tiptap/pm/model';
	import type { DetailsOptions } from './batteries/syfxlin-ext/foldable/details';
	import type { DetailsContentOptions } from './batteries/syfxlin-ext/foldable/details-content';
	import type { DetailsSummaryOptions } from './batteries/syfxlin-ext/foldable/details-summary';

	export type HoveredBlock = { dom: HTMLElement; node: Node; pos: number; isEmpty: boolean };

	export interface WeEditor extends Editor {
		fresh?: {
			accentColor: () => string;
			reload: <T = any>(fn: () => T) => T | void;
		};
		ready?: Writable<boolean>;
		ext?: EditorExtensions;
		element?: HTMLElement;
	}

	export type EditorExtensions = Partial<{
		align: false | Partial<TextAlignOptions>;
		code: false | Partial<CodeBlockLowlightOptions>;
		draggable: false | {};

		fontKit:
			| false
			| Partial<{
					fontFamily: false | Partial<FontFamilyOptions>;
					fontSize: false | Partial<FontSizeOptions>;
					subscript: false | Partial<SubscriptExtensionOptions>;
					supersctipt: false | Partial<SuperscriptExtensionOptions>;
					highlight: false | Partial<HighlightOptions>;
			  }>;

		toolbar:
			| false
			| Partial<{
					bubble: false | Partial<BubbleMenuOptions>;
					fixed: boolean;
			  }>;

		heading: Partial<StarterKitOptions['heading']>;
		image:
			| Partial<
					ImageOptions & {
						upload: (formData: FormData) => Promise<EditorImage>;
					}
			  >
			| false;
		link: Partial<StarterKitOptions['link']>;
		list:
			| false
			| {
					taskList: false | Partial<TaskListOptions>;
					taskItem: false | Partial<TaskItemOptions>;
					bulletList: false | Partial<BulletListOptions>;
					details: false | Partial<DetailsOptions>;
					detailsSummary: false | Partial<DetailsSummaryOptions>;
					detailsContent: false | Partial<DetailsContentOptions>;
			  };
		slashCmd: false;
		wordCount: false | Partial<CharacterCountOptions>;
		table: false | Partial<TableKitOptions>;
		toc: false | Partial<TableOfContentsOptions>;
	}>;

	function hoveredBlockElement(e: MouseEvent, editor: Editor): null | HoveredBlock {
		const view = editor.view;

		if (!view) return null;

		const editorEl = view.dom;

		if (!editorEl) return null;

		const target = e.target as HTMLElement | null;
		if (!target) return null;

		const dom = target.closest('.__ED-ROOT > *') as HTMLElement | null;
		if (!dom || !editorEl.contains(dom)) return null;

		const pos = view.posAtDOM(dom, 0);
		const _pos = view.state.doc.resolve(pos);

		let depth = _pos.depth;
		while (depth > 0 && !_pos.node(depth).isBlock) {
			depth--;
		}
		const node = _pos.node(depth);

		let blockPos;
		try {
			blockPos = _pos?.before(depth);
		} catch (e) {
			blockPos = _pos.pos;
		}

		//TODO: Fix image block select
		// const node = _pos.parent;
		// const blockPos = _pos.pos;

		let isEmpty = node.type.name === 'doc' || false;

		if (!node || node.childCount === 0) {
			isEmpty =
				dom.classList.contains('is-empty') ||
				dom.innerHTML === '<br class="ProseMirror-trailingBreak">';
		}

		return { dom, node, pos: blockPos, isEmpty };
	}

	function include(x: any) {
		return x !== false;
	}
</script>

<script lang="ts">
	import { Editor, type Extensions } from '@tiptap/core';

	import { Placeholder, type CharacterCountOptions } from '@tiptap/extensions';
	import StarterKit, { type StarterKitOptions } from '@tiptap/starter-kit';
	import { onDestroy, onMount } from 'svelte';
	import { writable, type Writable } from 'svelte/store';

	import AlignBattery from './batteries/align-battery.svelte';
	import CodeBattery from './batteries/code-battery.svelte';
	import DraggableBattery from './batteries/draggable.svelte';
	import FontKitBattery from './batteries/font-kit-battery.svelte';
	import HeadingBattery from './batteries/heading-battery.svelte';
	import ImageBattery, { type EditorImage } from './batteries/image-battery.svelte';
	import LinkBattery from './batteries/link-battery.svelte';
	import ListBattery from './batteries/list-battery.svelte';
	import SlashCommand from './batteries/slash-command.svelte';
	import TableBattery from './batteries/table-battery.svelte';
	import TocBattery from './batteries/toc-battery.svelte';
	import ToolbarBattery from './batteries/toolbar.svelte';
	import WordCount from './batteries/word-count.svelte';

	let {
		accentColor = 'bg-accent',
		content,
		ext
	}: {
		accentColor?: string;
		content?: string;
		ext?: EditorExtensions;
	} = $props();

	let editor = $state<WeEditor | null>(null);
	let editorStateReload = $state();
	let element = $state<HTMLElement | null>(null);
	let hoveredBlock = $state<null | HoveredBlock>(null);
	let ready = writable(false);

	// @ts-expect-error Init extension in the editor for the first paint and mount other components
	editor = {
		ext,
		ready
	};

	// Batteries (Extensions)
	let headRef = $state<HeadingBattery>();
	let alignRef = $state<AlignBattery>();
	let listRef = $state<ListBattery>();
	let fontRef = $state<FontKitBattery>();
	let linkRef = $state<LinkBattery>();
	let tableRef = $state<TableBattery>();
	let tocRef = $state<TocBattery>();
	let codeRef = $state<CodeBattery>();
	let imgRef = $state<ImageBattery>();
	let toolbarRef = $state<ToolbarBattery>();
	let dragRef = $state<DraggableBattery>();
	let slashRef = $state<SlashCommand>();
	let wordCountRef = $state<WordCount>();

	function addExtension() {
		// Init starter kit first
		extensions.push(StarterKit.configure(getStarterKitconfig()));

		// Init placeholder next
		extensions.push(
			Placeholder.configure({
				includeChildren: true,
				placeholder: ({ node }) => {
					if (node.type.name === 'detailsSummary') return 'Foldable summary...';

					return include(ext?.slashCmd) ? "Type '/' for commands..." : 'Express yourself...';
				}
			})
		);

		if (alignRef) extensions.push(alignRef.config());
		if (listRef) extensions.push(...listRef.config());
		if (tableRef) extensions.push(tableRef.config());
		// if (toolbarRef) extensions.push(toolbarRef.config());
		if (tocRef) extensions.push(tocRef.config());
		if (fontRef) extensions.push(...fontRef.config());
		if (codeRef) extensions.push(codeRef.config());
		if (wordCountRef) extensions.push(wordCountRef.config());
		if (imgRef) extensions.push(...imgRef.config());
	}

	function batteriesScanner(editor: WeEditor) {
		headRef?.scanner(editor);
		tableRef?.scanner(editor);
		linkRef?.scanner(editor);
		listRef?.scanner(editor);
		alignRef?.scanner(editor);
		fontRef?.scanner(editor);
		slashRef?.scanner(editor);
		wordCountRef?.scanner(editor);
		imgRef?.scanner(editor);
		toolbarRef?.scanner(editor);
	}

	function slashCommands() {
		return {
			...headRef?.slashCommands(),
			...listRef?.slashCommands(),
			...fontRef?.slashCommands(),
			...codeRef?.slashCommands(),
			...imgRef?.slashCommands()
		};
	}

	function tools() {
		return {
			p1: [headRef!.toolbar],
			p3: [
				alignRef!.toolbar,
				fontRef!.fontFamily,
				fontRef!.fontSize,
				listRef!.toolbar,
				listRef!.indent,
				listRef!.outdent,
				listRef!.details,

				toolbarRef!.separator,

				linkRef!.toolbar,
				imgRef!.toolbar,
				tableRef!.toolbar,

				toolbarRef!.separator,

				fontRef!.blockquote,
				codeRef!.code,
				codeRef!.codeBlock,
				fontRef!.subscript,
				fontRef!.superscript,

				toolbarRef!.separator,

				fontRef!.divider,
				fontRef!.fontColor,
				fontRef!.fontHighlight,
				tocRef!.toolbar
			]
		};
	}

	function getStarterKitconfig(): Partial<StarterKitOptions> {
		let kit: Partial<StarterKitOptions> = {
			bulletList: false,
			codeBlock: false
		};

		if (headRef) kit = { ...kit, ...headRef.config() };
		if (linkRef) kit = { ...kit, ...linkRef.config() };

		return kit;
	}

	let extensions: Extensions = [];

	// Init
	onMount(() => {
		addExtension();

		if (!element) return;

		editor = new Editor({
			element: element,
			extensions: extensions,
			content: content,

			onTransaction: ({ editor }) => {
				editorStateReload = editor.state;
				batteriesScanner(editor);
			},

			editorProps: {
				attributes: {
					class:
						'__ED-ROOT prose prose-stone dark:prose-invert md:prose-lg ld:prose-xl max-w-none min-h-[500px] outline-none bg-background p-10'
				},
				handleKeyDown: (view, e) => {
					const s = slashRef?.action.navigate(e);

					if (s) return true;

					return false;
				}
			}
		});

		editor = Object.assign(editor as Editor, {
			fresh: {
				accentColor: () => accentColor,
				reload: <T = any,>(fn: () => T): T | void => {
					if (editorStateReload) return fn();
				}
			},
			ready,
			ext,
			element
		}) satisfies WeEditor;

		const handleMouseMove = (e: MouseEvent) => {
			const blockEl = hoveredBlockElement(e, editor!);
			if (!blockEl || blockEl === hoveredBlock) return;
			hoveredBlock = blockEl;

			dragRef?.action.show(blockEl);
		};

		const handleMouseLeave = () => {
			dragRef?.action.hide(true);
		};

		editor.view.dom.addEventListener('mousemove', handleMouseMove);
		editor.view.dom.addEventListener('mouseleave', handleMouseLeave);

		onDestroy(() => {
			if (editor) {
				editor.view.dom.removeEventListener('mousemove', handleMouseMove);
				editor.view.dom.removeEventListener('mouseleave', handleMouseLeave);
				editor.destroy();
			}
		});

		ready.set(true);
	});
</script>

<!-- Start Batteries -->
{#if include(ext?.heading)}
	<HeadingBattery {editor} bind:this={headRef} />
{/if}
{#if include(ext?.align)}
	<AlignBattery {editor} bind:this={alignRef} />
{/if}
{#if include(ext?.list)}
	<ListBattery {editor} bind:this={listRef} />
{/if}
{#if include(ext?.fontKit)}
	<FontKitBattery {editor} bind:this={fontRef} />
{/if}
{#if include(ext?.link)}
	<LinkBattery {editor} bind:this={linkRef} />
{/if}
{#if include(ext?.table)}
	<TableBattery {editor} {hoveredBlock} bind:this={tableRef} />
{/if}
{#if include(ext?.toc)}
	<TocBattery {editor} bind:this={tocRef} />
{/if}
{#if include(ext?.code)}
	<CodeBattery {editor} bind:this={codeRef} />
{/if}
{#if include(ext?.image)}
	<ImageBattery {editor} bind:this={imgRef} />
{/if}

<!--//End Batteries -->

<div>
	{#if include(ext?.toolbar) || (ext?.toolbar && ext?.toolbar.fixed)}
		{@render toolbarRef?.fixed()}
	{/if}

	<div class="relative">
		<div class="rounded-br-lg rounded-bl-lg bg-muted p-10" bind:this={element}></div>

		{#if include(ext?.table)}
			{@render tableRef?.decorator()}
		{/if}

		{#if include(ext?.slashCmd)}
			<SlashCommand {editor} bind:this={slashRef} cmds={slashCommands} />
		{/if}

		{#if include(ext?.draggable)}
			<DraggableBattery {hoveredBlock} {editor} bind:this={dragRef} />
		{/if}

		{#if include(wordCountRef)}
			<WordCount {editor} bind:this={wordCountRef} />
		{/if}
	</div>
</div>

<!-- Activate All Tools and Scanners -->
{#if include(ext?.toolbar)}
	<ToolbarBattery {editor} bind:this={toolbarRef} {tools} />
{/if}

<style>
	@reference "../../../../app.css";

	:global(.__ED-ROOT .is-empty:not(div)::before) {
		content: attr(data-placeholder);
		float: left;
		height: 0;
		pointer-events: none;
		@apply text-gray-500 opacity-50 dark:text-gray-300;
	}

	:global(.__ED-ROOT [loading='true']) {
		@apply relative border-8 border-accent;
	}
	:global(.__ED-ROOT [loading='true']::before) {
		@apply absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center bg-background/70 text-2xl text-foreground;

		content: 'Loading...';
	}
</style>
