<script lang="ts">
	import { debounce } from '$lib/osai-std/operations';
	import { CharacterCount, type CharacterCountOptions } from '@tiptap/extensions';
	import type { WeEditor } from '../core.svelte';

	let {
		editor
	}: {
		editor: WeEditor | null;
	} = $props();

	let strCount = $state({
		word: 0,
		char: 0
	});

	export function config() {
		return CharacterCount.configure(editor?.ext!.wordCount as Partial<CharacterCountOptions>);
	}

	export function scanner(editor: WeEditor) {
		debounce(
			() =>
				(strCount = {
					word: editor.extensionStorage.characterCount.words(),
					char: editor.extensionStorage.characterCount.characters()
				}),
			150
		);
	}
</script>

<div class="absolute bottom-1 left-10 z-1 flex gap-2">
	<div class="bg-popover flex gap-1 rounded-lg px-2 py-1 text-sm">
		<div>Words:</div>
		<strong>{strCount.word}</strong>
	</div>
	<div class="bg-popover flex gap-1 rounded-lg px-2 py-1 text-sm">
		<div>Characters:</div>
		<strong>{strCount.char}</strong>
	</div>
</div>
