<script lang="ts">
	import * as Popover from '$lib/components/ui/popover';
	import { Separator } from '$lib/components/ui/separator';
	import { Btn } from '$lib/osai/components/button';
	import { notify } from '$lib/osai/components/modal';
	import { copy2Clipboard } from '$lib/osai/operations';
	import {
		Clipboard,
		Copy,
		GripVertical,
		Plus,
		RemoveFormattingIcon,
		Trash2
	} from '@lucide/svelte';
	import type { Range } from '@tiptap/core';
	import { DOMSerializer } from '@tiptap/pm/model';
	import type { Component } from 'svelte';
	import type { HoveredBlock, WeEditor } from '../core.svelte';

	let {
		editor,
		hoveredBlock
	}: {
		editor: WeEditor | null;
		hoveredBlock: HoveredBlock | null;
	} = $props();

	type DragCommandObj = {
		title: string;
		icon: Component;
		command: (editor: WeEditor, block: Range) => boolean;
	};

	let showBlockHandle = $state(false);
	let blockHandleTop = $state(0);
	let handleHovered = $state(false);
	let editorElement = $state<HTMLElement>();

	editor?.ready?.subscribe((v) => {
		if (!v) return;

		editorElement = editor?.element!;
	});

	const dragCommands: { [key: string]: DragCommandObj } = {
		copy: {
			title: 'Copy Block',
			icon: Clipboard,
			command: (editor, block) => {
				copy2Clipboard(clip2HTML(editor, editor.state.doc.cut(block.from, block.to)), {
					html: true,
					success: (r) => notify.info('Copied block to clipboard')
				});
				return true;
			}
		},
		duplicate: {
			title: 'Duplicate Block',
			icon: Copy,
			command: (editor, block) => {
				const clip = editor.state.doc.cut(block.from, block.to);
				return editor
					.chain()
					.insertContentAt(block.to, clip.toJSON())
					.setTextSelection(block.to + 1)
					.run();
			}
		},
		clear: {
			title: 'Clear Format',
			icon: RemoveFormattingIcon,
			command: (editor, block) => {
				return editor
					.chain()
					.setTextSelection({ from: block.from + 1, to: block.to })
					.unsetAllMarks()
					.setTextSelection(block.from)
					.run();
			}
		},
		delete: {
			title: 'Delete Block',
			icon: Trash2,
			command: (editor, block) => {
				return editor.chain().deleteRange(block).run();
			}
		}
	};

	function newBlock() {
		if (!hoveredBlock) return;
		const { pos, node } = hoveredBlock;
		const insertPos = pos + (node?.nodeSize ?? 0);

		editor
			?.chain()
			.focus()
			.insertContentAt(insertPos, { type: 'paragraph', content: [{ type: 'text', text: '/' }] })
			.run();
	}

	function clip2HTML(editor: WeEditor, clip: any): string {
		const div = document.createElement('div');
		div.appendChild(DOMSerializer.fromSchema(editor.schema).serializeFragment(clip.content));
		const content = div.innerHTML;
		div.remove();
		return content;
	}

	function draggableActions(cmd: (editor: WeEditor, block: Range) => boolean) {
		if (!hoveredBlock || hoveredBlock.isEmpty) return;

		const block = {
			from: hoveredBlock!.pos,
			to: hoveredBlock!.node.nodeSize + hoveredBlock!.pos
		};

		cmd(editor!, block);
	}

	export const action = {
		show: (blockEl: HoveredBlock) => {
			if (!editorElement) return;

			const editorRect = editorElement.getBoundingClientRect();
			const blockRect = blockEl.dom.getBoundingClientRect();

			blockHandleTop = blockRect.top - editorRect.top;
			showBlockHandle = true;
		},
		hide: (editorLeave: boolean) => {
			setTimeout(() => {
				if (editorLeave && !handleHovered) {
					showBlockHandle = false;
					hoveredBlock = null;
					handleHovered = false;
				}
			}, 300);
		}
	};

	let blockPopover = $state(false);
	let allowDrag = $state(false);

	function handleDragStart(e: DragEvent) {
		if (!allowDrag) {
			e.preventDefault();
			return;
		}

		// Optionally mark element as being dragged
		const target = e.currentTarget as HTMLElement;
		target.classList.add('dragging');

		e.dataTransfer!.effectAllowed = 'move';
		e.dataTransfer!.setData('text/plain', 'block');
	}

	function handleDragEnd(e: DragEvent) {
		const target = e.currentTarget as HTMLElement;
		target.classList.remove('dragging');
		allowDrag = false;
	}
</script>

<!-- Draggable Menu -->
{#if showBlockHandle}
	<div
		role="button"
		tabindex="-1"
		class="absolute z-10 flex cursor-pointer transition-opacity"
		style="top: {blockHandleTop}px; left: -35px; opacity: {showBlockHandle ? 1 : 0};"
		onmouseenter={() => (handleHovered = true)}
		onmouseleave={() => {
			handleHovered = false;
			action.hide(false);
		}}
		draggable={true}
		ondragstart={handleDragStart}
		ondragend={handleDragEnd}
	>
		<Btn onclick={newBlock} variant="ghost"><Plus /></Btn>

		<Popover.Root bind:open={blockPopover}>
			<Popover.Trigger
				onclick={() => (blockPopover = !!blockPopover)}
				onmousedown={() => (allowDrag = true)}
				onmouseup={() => (allowDrag = false)}
			>
				{#snippet child({ props })}
					<Btn
						{...props}
						variant="ghost"
						class="relative overflow-hidden"
						title="Click for menu or drag to reposition element"
					>
						<span class="absolute top-0 right-0 bottom-0 left-0"></span>
						<GripVertical tabindex={-1} />
						<span class="sr-only">Click for Menu or Drag to reposition block</span>
					</Btn>
				{/snippet}
			</Popover.Trigger>
			<Popover.Content class="w-[190px]">
				<h4 class="font-bold uppercase">{hoveredBlock?.node?.type?.name ?? 'EMPTY BLOCK'}</h4>
				{#each Object.entries(dragCommands) as [i, drag] (i)}
					{@const Icon = drag.icon}
					{@const isDelete = i === 'delete'}

					{#if isDelete}
						<Separator class="h-2 w-full" />
					{/if}

					<Btn
						variant={isDelete ? 'destructive' : 'ghost'}
						class="mb-1 w-full justify-start p-2 py-1"
						onclick={() => {
							draggableActions(drag.command);
							blockPopover = false;
						}}
					>
						<span class="text-inherit/90">
							<Icon />
						</span>
						{drag.title}
					</Btn>
				{/each}
			</Popover.Content>
		</Popover.Root>
	</div>
{/if}
