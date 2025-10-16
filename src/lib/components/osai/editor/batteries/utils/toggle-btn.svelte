<script lang="ts">
	import { Btn } from '$lib/components/osai/button';
	import { type Component } from 'svelte';
	import type { WeEditor } from '../../core.svelte';

	let {
		editor,
		ref = $bindable(null),
		icon: Icon,
		onclick,
		isActive,
		disabled,
		title,
		id
	}: {
		ref?: HTMLElement | null;
		editor: WeEditor | null;
		icon: Component;
		onclick: () => void;
		isActive?: (key: string) => boolean;
		disabled?: () => boolean;
		title: string;
		id?: string;
	} = $props();

	const weEditor = $derived(editor);

	function btnActive(key: string) {
		if (isActive) {
			return weEditor?.fresh?.reload(() => {
				return isActive(key) ? weEditor?.fresh?.accentColor() : '';
			});
		}

		return weEditor?.fresh?.reload(() => {
			return weEditor?.isActive(key) ? weEditor?.fresh?.accentColor() : '';
		});
	}
	const useClass = disabled ? false : true;
</script>

<Btn
	variant="ghost"
	bind:ref
	size="icon"
	class={'h-8 w-8 ' + (useClass ? btnActive(id ?? title.toLowerCase()) : '')}
	onclick={() => onclick()}
	disabled={disabled ? (weEditor?.fresh?.reload(disabled) ?? false) : false}
	{title}
>
	<Icon class="h-4 w-4" />
</Btn>
