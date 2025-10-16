<script lang="ts">
	import {
		List,
		ListChevronsUpDown,
		ListIndentDecrease,
		ListIndentIncrease,
		ListOrdered,
		ListTodo,
		Logs
	} from '@lucide/svelte';
	import { BulletList, TaskItem, TaskList } from '@tiptap/extension-list';
	import type { Snippet } from 'svelte';
	import type { WeEditor } from '../core.svelte';
	import { Details } from './syfxlin-ext/foldable/details';
	import { DetailsContent } from './syfxlin-ext/foldable/details-content';
	import { DetailsSummary } from './syfxlin-ext/foldable/details-summary';
	import DropdownBtn, { type DropdownEntries } from './utils/dropdown-btn.svelte';
	import ToggleBtn from './utils/toggle-btn.svelte';

	let {
		editor
	}: {
		editor: WeEditor | null;
	} = $props();

	editor?.ready?.subscribe((v) => {
		if (!v) return;

		editor.commands.updateAttributes('details', { open: !editor.getAttributes('details').open });
	});

	const entries: DropdownEntries = {
		def: {
			title: 'List Items',
			icon: Logs,
			go: () => editor?.chain().focus().toggleBulletList().toggleBulletList().run(),
			default: true
		},
		ol: {
			title: 'Numbered List',
			icon: ListOrdered,
			go: () => editor?.chain().focus().toggleOrderedList().run(),
			keywords: ['ol', 'list', 'numbered']
		},
		ul: {
			title: 'Bullet List',
			icon: List,
			go: () => editor?.chain().focus().toggleBulletList().run(),
			keywords: ['ul', 'list', 'bullet']
		},
		task: {
			title: 'Task List',
			icon: ListTodo,
			go: () => editor?.chain().focus().toggleTaskList().run(),
			keywords: ['task', 'todo', 'checkbox', 'checklist']
		}
	};

	let activeState = $state(entries.def);
	let inDetails = $state(false);
	let accentColor = $state('');

	if (editor?.fresh) {
		accentColor = editor.fresh.accentColor();
	}

	function listScanner(editor: WeEditor) {
		if (editor.isActive('orderedList')) {
			activeState = entries.ol;
			return;
		}

		if (editor.isActive('ulLst')) {
			activeState = entries.ul;
			return;
		}

		if (editor.isActive('taskList')) {
			activeState = entries.task;
			return;
		}

		activeState = entries.def;
	}

	function detailsScanner(editor: WeEditor) {
		inDetails = editor.getAttributes('details').open !== undefined;
	}

	export function scanner(editor: WeEditor) {
		listScanner(editor);
		detailsScanner(editor);
	}

	export function slashCommands() {
		return entries;
	}

	export function config() {
		return [
			TaskList,
			TaskItem,
			BulletList.extend({
				name: 'ulLst'
			}),
			Details.configure({
				persist: true
			}),
			DetailsSummary,
			DetailsContent
		];
	}

	export const toolbar: Snippet = toolbarBtn;
	export const indent: Snippet = indentBtn;
	export const outdent: Snippet = outdentBtn;
	export const details: Snippet = detailsBtn;
</script>

{#snippet toolbarBtn()}
	<DropdownBtn {accentColor} title={'List Items'} {entries} activeState={() => activeState} />
{/snippet}

{#snippet indentBtn()}
	<ToggleBtn
		{editor}
		icon={ListIndentIncrease}
		title="Indent"
		onclick={() => editor?.chain().focus().sinkListItem('listItem').run()}
		disabled={() => !editor?.can().sinkListItem('listItem')}
	/>
{/snippet}

{#snippet outdentBtn()}
	<ToggleBtn
		{editor}
		icon={ListIndentDecrease}
		title="Outdent"
		onclick={() => editor?.chain().focus().liftListItem('listItem').run()}
		disabled={() => !editor?.can().liftListItem('listItem')}
	/>
{/snippet}

{#snippet detailsBtn()}
	<ToggleBtn
		{editor}
		icon={ListChevronsUpDown}
		title="Foldable Block"
		onclick={() => editor?.chain().focus().toggleDetails().run()}
		isActive={() => inDetails}
	/>
{/snippet}

<style>
	@reference "../../../../../app.css";

	:global(.__ED-ROOT [data-type='taskList']) {
		list-style: none;
	}
	:global(.__ED-ROOT [data-type='taskList'] > li) {
		position: relative;
	}
	:global(.__ED-ROOT [data-type='taskList'] > li > label) {
		position: absolute;
		top: 0;
		left: -20px;
		cursor: pointer;
	}

	:global(.__ED-ROOT [data-type='details']) {
		@apply mb-2 flex rounded-md border-1 border-gray-500 p-1;
		transition-duration: 0.15s;
		transition-property: border;
	}
	:global(.__ED-ROOT [data-type='details']:hover) {
		@apply border-2;
	}
	:global(.__ED-ROOT [data-type='details'] [data-type='detailsButton']) {
		outline: none;
		border: none;
	}
	:global(.__ED-ROOT [data-type='details'] [data-type='detailsButton'] .lucide-icon) {
		@apply rotate-z-0;
	}

	:global(.__ED-ROOT [data-type='details'] [data-type='detailsContainer']) {
		flex: 1;
		margin-left: 0.25em;
	}

	:global(.__ED-ROOT [data-type='detailsSummary']) {
		list-style: none;
	}

	:global(
		.__ED-ROOT [data-type='details'] [data-type='detailsContainer'] [data-type='detailsContent']
	) {
		display: none;
	}
	:global(.__ED-ROOT [data-type='details'][open] [data-type='detailsButton'] .lucide-icon) {
		@apply rotate-z-90;
	}
	:global(
		.__ED-ROOT
			[data-type='details'][open]
			[data-type='detailsContainer']
			[data-type='detailsContent']
	) {
		display: block;
	}
</style>
