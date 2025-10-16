<script lang="ts">
	import { Ellipsis, EllipsisVertical, Table } from '@lucide/svelte';
	import type { Editor } from '@tiptap/core';
	import { TableKit } from '@tiptap/extension-table';
	import { DropdownMenu } from 'bits-ui';
	import { type Snippet } from 'svelte';
	import { Btn } from '../../button';
	import type { HoveredBlock, WeEditor } from '../core.svelte';
	import type { ToolbarTool } from './toolbar.svelte';
	import ToggleBtn from './utils/toggle-btn.svelte';

	let {
		editor,
		hoveredBlock
	}: {
		editor: WeEditor | null;
		hoveredBlock: HoveredBlock | null;
	} = $props();

	let tableFirstRow = $state<{ top: number; height: number; index: number }[]>([]);
	let tableFirstCol = $state<{ left: number; width: number; index: number }[]>([]);
	let currentTable = $state<DOMRect | null>(null);
	let showDecorator = $state(false);
	let blockHandleTop = $state<number>();

	editor?.ready?.subscribe((v) => {
		if (!v) return;
		if (hoveredBlock)
			blockHandleTop =
				hoveredBlock.dom.getBoundingClientRect().top - editor?.element!.getBoundingClientRect().top;
	});

	const action = {
		insert: () =>
			editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: false }).run(),

		addRowAfter: () => editor?.chain().focus().addRowAfter().run(),
		addRowBefore: () => editor?.chain().focus().addRowBefore().run(),
		delRow: () => editor?.chain().focus().deleteRow().run(),

		addColAfter: () => editor?.chain().focus().addColumnAfter().run(),
		addColBefore: () => editor?.chain().focus().addColumnBefore().run(),
		delCol: () => editor?.chain().focus().deleteColumn().run()
	};

	export function config() {
		return TableKit.configure({
			table: {
				resizable: true,
				allowTableNodeSelection: true
			}
		});
	}

	export function scanner(editor: Editor) {
		showDecorator = false;

		if (!editor.isActive('table')) return;

		const view = editor.view;
		const state = editor.view.state;

		let depth = state.selection.$anchor.depth;
		let tableDom: Element | undefined;

		while (depth > 0) {
			const node = state.selection.$anchor.node(depth);
			if (node.type.name === 'table') {
				// @ts-ignore
				tableDom = view.domAtPos(state.selection.$anchor.start(depth)).node.closest('table');
				break;
			}
			depth--;
		}

		if (!tableDom) return;

		const tableRect = tableDom.getBoundingClientRect();
		const allRows = tableDom.querySelectorAll('tr');
		const colHeads = allRows[0]?.querySelectorAll('td,th') ?? [];

		tableFirstRow = [];
		tableFirstCol = [];
		currentTable = tableDom.getBoundingClientRect();

		allRows.forEach((tr, i) => {
			const rect = tr.getBoundingClientRect();
			tableFirstRow.push({ top: rect.top - tableRect.top, height: rect.height, index: i });
		});

		colHeads.forEach((cell, i) => {
			const rect = cell.getBoundingClientRect();
			tableFirstCol.push({ left: rect.left - tableRect.top, width: rect.width, index: i });
		});

		showDecorator = true;
	}

	export const toolbar: ToolbarTool = toolbarBtn;
	export const decorator: Snippet = decoratorContainer;
</script>

{#snippet toolbarBtn()}
	<ToggleBtn
		{editor}
		icon={Table}
		title="Insert Table"
		id="table"
		onclick={() => action.insert()}
	/>
{/snippet}

{#snippet decoratorContainer()}
	{#if showDecorator}
		<div class="pointer-events-none absolute inset-0">
			<!-- Column buttons (top edge) -->
			<div
				class="pointer-events-auto absolute left-10 ms-10 flex justify-between py-2"
				style={`top: ${blockHandleTop! - 50}px; width: ${currentTable!.width}px;`}
			>
				{#each tableFirstCol as col}
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							{#snippet child({ props })}
								<Btn variant="ghost" {...props} class="mx-auto">
									<Ellipsis />
								</Btn>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content side="bottom">
							<DropdownMenu.Item onclick={() => action.addColBefore()}
								>Add Column Before</DropdownMenu.Item
							>
							<DropdownMenu.Item onclick={() => action.addColAfter()}
								>Add Column After</DropdownMenu.Item
							>
							<DropdownMenu.Item onclick={() => action.delCol()}>Delete Column</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				{/each}
			</div>

			<!-- Row buttons (left edge) -->
			<div
				class="pointer-events-auto absolute left-10 z-[1px] flex flex-col justify-between"
				style={`top: ${blockHandleTop}px; height: ${currentTable!.height}px`}
			>
				{#each tableFirstRow as row}
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							{#snippet child({ props })}
								<Btn variant="ghost" {...props} class="my-auto">
									<EllipsisVertical />
								</Btn>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content side="right">
							<DropdownMenu.Item onclick={() => action.addRowBefore()}
								>Add Row Before</DropdownMenu.Item
							>
							<DropdownMenu.Item onclick={() => action.addRowAfter()}
								>Add Row After</DropdownMenu.Item
							>
							<DropdownMenu.Item onclick={() => action.delRow()}>Delete Row</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				{/each}
			</div>
		</div>
	{/if}
{/snippet}

<style>
	@reference "../../../../../app.css";

	/* Table */
	:global(.__ED-ROOT table td) {
		border-color: var(--tw-prose-td-borders);
		border-width: 1px;
	}
</style>
