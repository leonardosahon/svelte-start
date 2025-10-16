<script lang="ts">
	import {
		AArrowDown,
		AArrowUp,
		ALargeSmall,
		Baseline,
		Highlighter,
		Minus,
		Quote,
		Subscript,
		Superscript,
		Type
	} from '@lucide/svelte';
	import { Color } from '@tiptap/extension-color';
	import { FontFamily } from '@tiptap/extension-font-family';
	import Highlight from '@tiptap/extension-highlight';
	import TiptapSubscript from '@tiptap/extension-subscript';
	import TiptapSuperscript from '@tiptap/extension-superscript';
	import { FontSize, TextStyle } from '@tiptap/extension-text-style';
	import type { WeEditor } from '../core.svelte';
	import type { ToolbarTool } from './toolbar.svelte';
	import ColorBtn from './utils/color-btn.svelte';
	import DropdownBtn, { type DropdownEntries } from './utils/dropdown-btn.svelte';
	import ToggleBtn from './utils/toggle-btn.svelte';

	let {
		editor
	}: {
		editor: WeEditor | null;
	} = $props();

	const familyEntries: DropdownEntries = {
		def: {
			title: 'Default',
			icon: Type,
			value: 'inherit',
			go: function () {
				return editor?.chain().focus().setFontFamily(this.value!).run();
			},
			default: true
		},
		sans: {
			title: 'Sans',
			icon: Type,
			value: 'var(--font-sans)',
			go: function () {
				return editor?.chain().focus().setFontFamily(this.value!).run();
			}
		},
		serif: {
			title: 'Serif',
			icon: Type,
			value: 'var(--font-serif)',
			go: function () {
				return editor?.chain().focus().setFontFamily(this.value!).run();
			}
		},
		mono: {
			title: 'Mono',
			icon: Type,
			value: 'var(--font-mono)',
			go: function () {
				return editor?.chain().focus().setFontFamily(this.value!).run();
			}
		}
	};

	const sizeEntries: DropdownEntries = {
		verySmall: {
			title: 'Very Small',
			icon: AArrowDown,
			value: 'var(--text-xs)',
			style: 'font-size: var(--text-xs)',
			go: function () {
				return editor?.chain().focus().setFontSize(this.value!).run();
			}
		},
		small: {
			title: 'Small',
			icon: AArrowDown,
			value: 'var(--text-sm)',
			style: 'font-size: var(--text-sm)',
			go: function () {
				return editor?.chain().focus().setFontSize(this.value!).run();
			}
		},
		normal: {
			title: 'Normal',
			icon: ALargeSmall,
			value: 'inherit',
			style: 'font-size: inherit',
			go: function () {
				return editor?.chain().focus().setFontSize(this.value!).run();
			},
			default: true
		},
		large: {
			title: 'Large',
			icon: AArrowUp,
			value: 'var(--text-lg)',
			style: 'font-size: var(--text-lg)',
			go: function () {
				return editor?.chain().focus().setFontSize(this.value!).run();
			}
		},
		veryLarge: {
			title: 'Very Large',
			icon: AArrowUp,
			value: 'var(--text-xl)',
			style: 'font-size: var(--text-xl)',
			go: function () {
				return editor?.chain().focus().setFontSize(this.value!).run();
			}
		}
	};

	let activeFont = $state(familyEntries.def);
	let activeFontSize = $state(sizeEntries.normal);
	let activeColor = $state<string>();
	let activeHighlight = $state<string>();
	let accentColor = $state<string>('');

	editor?.ready?.subscribe((v) => {
		if (!v) return;

		accentColor = editor!.fresh!.accentColor();
	});

	const colorPreset = [
		{ name: 'Yellow', value: '#ffff00' },
		{ name: 'Green', value: '#90EE90' },
		{ name: 'Blue', value: '#ADD8E6' },
		{ name: 'Pink', value: '#FFB6C1' },
		{ name: 'Orange', value: '#FFD580' }
	];

	function familyScanner(editor: WeEditor) {
		const family = editor.getAttributes('textStyle')?.fontFamily;

		if (!family) {
			activeFont = familyEntries.def;
			return;
		}

		Object.entries(familyEntries).find(([k, d]) => {
			if (family === d.value) {
				activeFont = d;
				return true;
			}
		});
	}

	function sizeScanner(editor: WeEditor) {
		const size = editor.getAttributes('textStyle')?.fontSize;

		if (!size) {
			activeFontSize = sizeEntries.normal;
			return;
		}

		Object.entries(sizeEntries).find(([k, d]) => {
			if (size === d.value) {
				activeFontSize = d;
				return true;
			}
		});
	}

	function colorScanner(editor: WeEditor) {
		const color = editor?.getAttributes('textStyle').color;

		if (color) {
			activeColor = color;
			return;
		}

		activeColor = undefined;
	}

	function highlightScanner(editor: WeEditor) {
		const color = editor?.getAttributes('highlight').color;

		if (color) {
			activeHighlight = color;
			return;
		}

		activeHighlight = undefined;
	}

	export function scanner(editor: WeEditor) {
		familyScanner(editor);
		sizeScanner(editor);
		colorScanner(editor);
		highlightScanner(editor);
	}

	export function config() {
		return [
			TextStyle,
			Color,
			FontFamily,
			FontSize,
			TiptapSubscript,
			TiptapSuperscript,
			Highlight.configure({
				multicolor: true
			})
		];
	}

	export function slashCommands() {
		return {
			code: {
				title: 'Quote',
				icon: Quote,
				go: () => editor?.chain().focus().toggleBlockquote().run(),
				keywords: ['blockquote', 'quote']
			},
			hr: {
				title: 'Divider',
				icon: Minus,
				go: () => editor?.chain().focus().setHorizontalRule().run(),
				keywords: ['hr', 'divider', 'line']
			}
		};
	}

	export const fontFamily: ToolbarTool = fontFamilyBtn;
	export const fontSize: ToolbarTool = fontSizeBtn;
	export const fontColor: ToolbarTool = fontColorBtn;
	export const fontHighlight: ToolbarTool = fontHighlightBtn;
	export const subscript: ToolbarTool = subscriptBtn;
	export const superscript: ToolbarTool = superscriptBtn;
	export const divider: ToolbarTool = dividerBtn;
	export const blockquote: ToolbarTool = blockQuoteBtn;
</script>

{#snippet fontFamilyBtn()}
	<DropdownBtn
		{accentColor}
		title={'Font Family'}
		entries={familyEntries}
		activeState={() => activeFont}
	/>
{/snippet}

{#snippet fontSizeBtn()}
	<DropdownBtn
		{accentColor}
		title={'Font Sizes'}
		entries={sizeEntries}
		activeState={() => activeFontSize}
	/>
{/snippet}

{#snippet fontColorBtn()}
	<ColorBtn
		{editor}
		title={'Text Color'}
		presets={colorPreset}
		{activeColor}
		action={{
			set: (value) => editor?.chain().focus().setColor(value).run(),
			unset: () => editor?.chain().focus().unsetColor().run()
		}}
		icon={Baseline}
	/>
{/snippet}

{#snippet fontHighlightBtn()}
	<ColorBtn
		{editor}
		title={'Text Highlight'}
		{activeHighlight}
		presets={colorPreset}
		action={{
			set: (value) => editor?.chain().focus().setHighlight({ color: value }).run(),
			unset: () => editor?.chain().focus().unsetHighlight().run()
		}}
		icon={Highlighter}
	/>
{/snippet}

{#snippet subscriptBtn()}
	<ToggleBtn
		{editor}
		icon={Subscript}
		title="Subscript"
		onclick={() => editor?.chain().focus().toggleSubscript().run()}
	/>
{/snippet}

{#snippet superscriptBtn()}
	<ToggleBtn
		{editor}
		icon={Superscript}
		title="Superscript"
		onclick={() => editor?.chain().focus().toggleSuperscript().run()}
	/>
{/snippet}

{#snippet blockQuoteBtn()}
	<ToggleBtn
		{editor}
		icon={Quote}
		title="Quote"
		id="blockquote"
		onclick={() => editor?.chain().focus().toggleBlockquote().run()}
	/>
{/snippet}

{#snippet dividerBtn()}
	<ToggleBtn
		{editor}
		icon={Minus}
		title="Divider"
		onclick={() => editor?.chain().focus().setHorizontalRule().run()}
	/>
{/snippet}
