<script lang="ts">
	import { cn } from '$lib/utils';
	import { LoaderCircle } from '@lucide/svelte';
	import { heicTo } from 'heic-to';
	import { onMount } from 'svelte';

	let {
		src,
		placeholder,
		then,
		event = 'change',
		useReader = true,
		listen = true,
		class: className
	}: {
		src: HTMLInputElement;
		placeholder?: string;
		then?: () => void;
		event?: 'change' | 'input';
		useReader?: boolean;
		listen?: boolean;
		class?: string;
	} = $props();

	placeholder ??= '/placeholder.svg';
	let currentUrl = $state<string>(placeholder);
	let checkedHEIC = $state(false);
	let loading = $state(false);

	onMount(() => {
		if (listen) src.addEventListener(event, preview);

		preview();
	});

	async function handleHEIC(file: Blob) {
		loading = true;
		checkedHEIC = true;

		return await heicTo({
			blob: file,
			type: 'image/jpeg',
			quality: 0.8
		}).finally(() => (loading = false));
	}

	function useFileReader(file: Blob) {
		const reader = new FileReader();
		loading = true;

		reader.addEventListener('load', () => {
			loading = false;
			if (!reader.result) return;

			currentUrl = reader.result as string;

			if (then) then();
		});

		reader.readAsDataURL(file);
	}

	function useUrlObject(file: Blob) {
		currentUrl = URL.createObjectURL(file);
		if (then) then();
	}

	async function preview() {
		if (!src?.files || !src?.files[0]) {
			currentUrl = placeholder!;
			return;
		}

		let file: Blob = src.files[0];

		if (file.type === 'image/heic' && !checkedHEIC) {
			file = await handleHEIC(file);
		}
		if (useReader) useFileReader(file);
		else useUrlObject(file);
	}
</script>

<div class={cn('bg-muted relative h-full w-full', className)}>
	{#if loading}
		<div
			class="lef-0 absolute top-0 right-0 bottom-0 flex h-full w-full items-center justify-center bg-black/50"
		>
			<LoaderCircle class="h-1/6 w-1/6 animate-spin" />
		</div>
	{/if}
	<img class="h-full w-full object-contain" src={currentUrl} alt="Media preview" />
</div>
