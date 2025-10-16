<script lang="ts">
	import {
		getHierarchicalIndexes,
		TableOfContents,
		type TableOfContentData,
		type TableOfContentDataItem
	} from '@tiptap/extension-table-of-contents';

	import { Notebook } from '@lucide/svelte';
	import { Btn } from '../../button';
	import { Modal } from '../../modal';
	import type { WeEditor } from '../core.svelte';
	import type { ToolbarTool } from './toolbar.svelte';
	import ToggleBtn from './utils/toggle-btn.svelte';

	let {
		editor
	}: {
		editor: WeEditor | null;
	} = $props();

	let toc = $state<TableOfContentData>();
	let showTocModal = $state(false);
	let scroll2Toc = (item: TableOfContentDataItem) => {
		editor?.chain().focus().setTextSelection(item.pos).scrollIntoView().run();
		showTocModal = false;
	};

	export function config() {
		return TableOfContents.configure({
			getIndex: getHierarchicalIndexes,
			onUpdate(content) {
				toc = content;
			}
		});
	}

	export const toolbar: ToolbarTool = toolbarBtn;
</script>

{#snippet toolbarBtn()}
	<ToggleBtn
		{editor}
		icon={Notebook}
		title="Table of Contents"
		id="tableOfContent"
		onclick={() => (showTocModal = true)}
	/>
{/snippet}

<Modal title="Table of Contents" bind:open={showTocModal}>
	{#if showTocModal && toc?.length}
		<code>
			<ul class="bg-muted px-2 py-4">
				{#each toc as item}
					<li class="transition-all" style={`margin-left: ${(item.level - 1) * 1.25}rem`}>
						<Btn variant="ghost" class="block w-full text-left" onclick={() => scroll2Toc(item)}>
							{item.textContent}
						</Btn>
					</li>
				{/each}
			</ul>
		</code>
	{:else}
		<p class="text-sm text-muted-foreground">No headings found.</p>
	{/if}
</Modal>
