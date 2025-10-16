<script lang="ts">
	import * as Command from '$lib/components/ui/command';
	import type { CommandRootApi } from '$lib/components/ui/command/command.svelte';
	import type { Editor } from '@tiptap/core';
	import type { WeEditor } from '../core.svelte';
	import type { DropdownActiveState, DropdownEntries } from './utils/dropdown-btn.svelte';

	let {
		editor,
		cmds
	}: {
		editor: WeEditor | null;
		cmds: () => DropdownEntries | {};
	} = $props();

	let menuPos = $state({ top: 0, left: 0 });
	let searchQuery = $state('');
	let isVisible = $state(false);
	let commandRef = $state<{
		api: CommandRootApi | null;
		ref: HTMLElement | null;
	}>({
		api: null,
		ref: null
	});

	let currentCommand = $state<keyof DropdownEntries | null>(null);
	let cmdsEmpty = $state(false);
	let editorElement = $state<HTMLElement>();
	let cachedCmds = $state<[string, DropdownActiveState][]>();

	let slashCommands = $state<DropdownEntries>();

	editor?.ready?.subscribe((v) => {
		if (!v) return;

		cachedCmds = Object.entries(cmds());
		cmdsEmpty = cachedCmds?.length === 0;
		slashCommands = cmds();

		editorElement = editor?.element!;
	});

	function hideMenu() {
		searchQuery = '';
		isVisible = false;
	}

	function getFilteredSCommands() {
		const x = cachedCmds?.filter(([_, cmd]) => {
			if (!cmd.title || !cmd.keywords) return;

			return (
				cmd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				cmd.keywords.some((k) => k.includes(searchQuery.toLowerCase()))
			);
		});

		if (x?.length === 0) {
			setTimeout(hideMenu);
		}

		return x;
	}

	export function scanner(editor: Editor) {
		const { from, to } = editor.state.selection;
		const startOfLine = editor.state.selection.$from.parentOffset;
		const text = editor.state.doc.textBetween(from - startOfLine, to, '\0', '\0');

		if (text === '/') {
			const coords = editor.view.coordsAtPos(from);
			const editorRect = editorElement?.getBoundingClientRect();

			menuPos = {
				top: coords.bottom - (editorRect?.top || 0) + 50,
				left: coords.left - (editorRect?.left || 0)
			};

			isVisible = true;
			searchQuery = '';
		}

		if (isVisible) {
			if (text.startsWith('/')) searchQuery = text.slice(1);
			else hideMenu();
		}
	}

	export const action = {
		exec: (cmd: DropdownActiveState) => {
			if (!editor || cmdsEmpty) return;

			const { from, to } = editor.state.selection;
			const text = editor.state.doc.textBetween(from - searchQuery.length - 1, to, '\0', '\0');

			if (text.startsWith('/')) {
				editor
					.chain()
					.focus()
					.deleteRange({ from: from - searchQuery.length - 1, to })
					.run();
			}

			cmd.go();

			isVisible = false;
			searchQuery = '';
			currentCommand = '';
		},
		navigate: (e: KeyboardEvent) => {
			if (cmdsEmpty) return false;

			if (isVisible) {
				if (e.key === 'ArrowDown') {
					e.preventDefault();
					commandRef.api?.updateSelectedByItem(1);
					return true;
				}
				if (e.key === 'ArrowUp') {
					e.preventDefault();
					commandRef.api?.updateSelectedByItem(-1);
					return true;
				}
				if (e.key === 'Enter') {
					e.preventDefault();

					if (currentCommand && slashCommands) action.exec(slashCommands[currentCommand]);

					return true;
				}
				if (e.key === 'Escape') {
					e.preventDefault();
					hideMenu();
					return true;
				}
			}

			return false;
		}
	};
</script>

{#if isVisible}
	<div class="absolute z-50" style="top: {menuPos.top - 30}px; left: {menuPos.left}px;">
		<Command.Root
			class="w-64 rounded-lg border shadow-md"
			onValueChange={(v) => (currentCommand = v)}
			bind:api={commandRef.api}
			bind:ref={commandRef.ref}
			onblur={() => hideMenu()}
			onkeyup={(e) => (e.key === 'Escape' ? hideMenu() : true)}
			loop
		>
			<Command.List>
				<Command.Group heading="Commands">
					{#each getFilteredSCommands() as [i, cmd]}
						{@const Icon = cmd.icon}

						<Command.Item
							onSelect={() => action.exec(cmd)}
							class="flex items-center gap-x-3 {i === currentCommand ? 'bg-accent' : ''}"
							value={i}
						>
							<span class="text-muted-foreground">
								<Icon />
							</span>

							<span class="text-sm font-medium">{cmd.title}</span>
						</Command.Item>
					{:else}
						<Command.Empty>No commands found</Command.Empty>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</div>
{/if}
