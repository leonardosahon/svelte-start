<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const modalVariants = tv({
		variants: {
			variant: {
				sm: 'sm:max-w-[280px] md:max-w-[360px] lg:max-w-[420px] xl:max-w-[480px]',
				md: 'sm:max-w-[360px] md:max-w-[420px] lg:max-w-[500px] xl:max-w-[560px]',
				lg: 'sm:max-w-[420px] md:max-w-[500px] lg:max-w-[640px] xl:max-w-[720px]',
				xl: 'sm:max-w-[500px] md:max-w-[640px] lg:max-w-[720px] xl:max-w-[1204px]'
			}
		},
		defaultVariants: {
			variant: 'sm'
		}
	});

	export type ModalVariants = VariantProps<typeof modalVariants>['variant'];
</script>

<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { cn } from '$lib/utils.js';
	import { MediaQuery } from 'svelte/reactivity';

	const isDesktop = new MediaQuery('(min-width: 768px');

	let {
		title,
		children,
		centered = false,
		variant,
		description = null,
		footer = null,
		open = $bindable(false),
		onclose = () => null
	}: {
		title: string;
		children: any;
		open: boolean;
		footer?: any;
		variant?: ModalVariants;
		description?: string | null;
		centered?: boolean;
		onclose?: () => void;
	} = $props();

	function handleNotifier(event: Event) {
		const target = event.target as HTMLElement;

		// Sonner toast bug fix
		if (target.closest('[data-sonner-toast]')) {
			event.preventDefault();
			return;
		}

		open = false; // normal close
	}
</script>

{#if isDesktop.current}
	{#if centered}
		<Dialog.Root bind:open onOpenChangeComplete={(e) => e === false && onclose()}>
			<Dialog.Content
				showCloseButton={false}
				class={cn(modalVariants({ variant }), 'max-h-4/5')}
				onInteractOutside={handleNotifier}
			>
				<Dialog.Header>
					<Dialog.Title>{title}</Dialog.Title>
					<Dialog.Description>
						{description}
					</Dialog.Description>
				</Dialog.Header>

				<div class="overflow-auto">
					{@render children?.()}
				</div>

				{#if footer}
					<Dialog.Footer>
						{@render footer()}
					</Dialog.Footer>
				{/if}

				<Dialog.Close class="absolute top-4 right-4 cursor-pointer hover:text-red-400">
					✕
				</Dialog.Close>
			</Dialog.Content>
		</Dialog.Root>
	{:else}
		<Sheet.Root bind:open>
			<Sheet.Content onInteractOutside={handleNotifier} class={cn(modalVariants({ variant }))}>
				<Sheet.Header>
					<Sheet.Title>{title}</Sheet.Title>

					<Sheet.Description>
						{description}
					</Sheet.Description>
				</Sheet.Header>

				<div class="overflow-y-auto p-4">
					{@render children?.()}
				</div>

				{#if footer}
					<Sheet.Footer>
						{@render footer()}
					</Sheet.Footer>
				{/if}
			</Sheet.Content>
		</Sheet.Root>
	{/if}
{:else}
	<Drawer.Root bind:open>
		<Drawer.Content class="p-4" onInteractOutside={handleNotifier}>
			<Drawer.Header class="pl-0">
				<Drawer.Title>{title}</Drawer.Title>
				<Drawer.Description>
					{description}
				</Drawer.Description>
			</Drawer.Header>

			<div class="overflow-auto">
				{@render children?.()}
			</div>

			{#if footer}
				<Drawer.Footer>
					{@render footer()}
				</Drawer.Footer>
			{/if}
		</Drawer.Content>
	</Drawer.Root>
{/if}
