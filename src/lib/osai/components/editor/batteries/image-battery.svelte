<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Input } from '$lib/components/ui/input';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { Label } from '$lib/components/ui/label';
	import * as Popover from '$lib/components/ui/popover';
	import { Separator } from '$lib/components/ui/separator';
	import { cn } from '$lib/utils';
	import {
		AlignCenterVertical,
		AlignEndVertical,
		AlignStartVertical,
		Captions,
		Check,
		CheckIcon,
		CloudIcon,
		ImageIcon,
		ImagesIcon,
		SearchIcon,
		SquarePen,
		ToolCase,
		Upload
	} from '@lucide/svelte';
	import { mergeAttributes, type Editor } from '@tiptap/core';
	import FileHandler from '@tiptap/extension-file-handler';
	import Image from '@tiptap/extension-image';
	import { heicTo } from 'heic-to';

	import { Slider } from '$lib/components/ui/slider';
	import { debounce } from '$lib/osai/operations';
	import { NodeSelection } from '@tiptap/pm/state';
	import { onDestroy } from 'svelte';
	import { Btn } from '../../button';
	import MediaPreview from '../../media/media-preview.svelte';
	import { Modal, notify } from '../../modal';
	import type { WeEditor } from '../core.svelte';
	import type { ToolbarTool } from './toolbar.svelte';
	import BubbleMenu from './utils/bubble-menu.svelte';
	import { TippyConfig } from './utils/tippy-config';
	import ToggleBtn from './utils/toggle-btn.svelte';

	export type EditorImage = {
		id: number;
		url: string;
		name: string;
		width: number;
		height: number;
		size: number;
		tags: string[];
	};

	let {
		editor
	}: {
		editor: WeEditor | null;
	} = $props();

	let tippyRef = $state<TippyConfig>();
	let bubbleMenu = $state<HTMLElement>();
	let imageOnEditor = $state<Node | null>(null);
	let imageWidth = $state<number>(100);
	let imageAlign = $state<'left' | 'center' | 'right'>('left');
	let imageAlt = $state<string>();

	let imgLoading = $state(false);
	let uploading = $state(false);
	let altTextModalOpened = $state(false);
	let modalOpened = $state(false);
	let popoverOpened = $state(false);
	let searchQuery = $state('');
	let imageLink = $state('');
	let uploadData = $state<{
		file?: FileList;
		alt?: string;
		tags?: string;
	}>({
		file: undefined,
		alt: undefined,
		tags: undefined
	});

	let serverImages = $state<EditorImage[]>([]);
	let filteredImages = $derived<EditorImage[]>(serverImages);
	let selectedImage = $state<EditorImage>();
	let hoveredImage = $state<EditorImage>();
	let newImage = $state<EditorImage>();

	let filePicker = $state<HTMLInputElement>();

	editor?.ready?.subscribe((v) => {
		if (!v) return;

		tippyRef = new TippyConfig({
			editor: editor!,
			menu: bubbleMenu!
		});
	});

	onDestroy(() => {
		tippyRef?.destroy();
	});

	function updateAttribute({
		width,
		alt,
		align
	}: {
		width?: string;
		alt?: string;
		align?: typeof imageAlign;
	}) {
		if (!editor?.state) return;

		if (
			editor.state.selection instanceof NodeSelection &&
			editor.state.selection.node.type.name === 'image'
		) {
			const tr = editor.state.tr
				.setNodeMarkup(editor.state.selection.from, undefined, {
					...editor.state.selection.node.attrs,
					width: width ?? (imageWidth ? imageWidth + '%' : null),
					alt: alt ?? imageAlt,
					align: align ?? imageAlign
				})
				.scrollIntoView();

			editor.view.dispatch(tr);
		}
	}

	function updateWidth(width: number) {
		if (tippyRef?.currentNode)
			(tippyRef.currentNode as HTMLElement).querySelector('img')!.style.width = width + '%';
	}

	function updateAlign(align: typeof imageAlign) {
		if (tippyRef?.currentNode) {
			const img = (tippyRef.currentNode as HTMLElement).querySelector('img')!;

			switch (align) {
				case 'left':
					img.style.marginRight = 'auto';
					break;
				case 'center':
					img.style.margin = 'auto';
					break;
				case 'right':
					img.style.marginLeft = 'auto';
					break;
			}

			imageAlign = align;
			updateAttribute({ align });
		}
	}

	function formatSize(sizeInMB: number) {
		if (sizeInMB < 1) return `${Math.round(sizeInMB * 1024)} KB`;

		return `${sizeInMB.toFixed(1)} MB`;
	}

	function genId() {
		return 'ed_img-tmp-' + (Math.random() * 1e6).toFixed(0);
	}

	function getTempImg(id: string) {
		return editor?.view.posAtDOM(document.getElementById(id)!, 0);
	}

	function searchImage() {
		selectedImage = undefined;

		debounce(() => {
			filteredImages = serverImages.filter((img) => {
				return (
					img.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					img.tags.some((k) => k.includes(searchQuery.toLowerCase()))
				);
			});
		}, 250);
	}

	async function handleHEIC(file: Blob) {
		imgLoading = true;

		return await heicTo({
			blob: file,
			type: 'image/jpeg',
			quality: 0.8
		}).finally(() => (imgLoading = false));
	}

	async function handleDynamicFile({
		file,
		currentEditor,
		pos
	}: {
		currentEditor: WeEditor;
		file: File;
		pos: number;
	}) {
		const id = genId();

		if (file.type === 'image/heic') {
			currentEditor
				.chain()
				.insertContentAt(pos, {
					type: 'image',
					attrs: {
						src: '/placeholder.svg',
						loading: true,
						loadingId: id
					}
				})
				.focus()
				.run();

			file = (await handleHEIC(file)) as File;

			pos = getTempImg(id)!;

			currentEditor.chain().setNodeSelection(pos).deleteSelection().run();
		}

		const fileReader = new FileReader();

		fileReader.readAsDataURL(file);
		fileReader.onload = () => {
			currentEditor
				.chain()
				.insertContentAt(pos, {
					type: 'image',
					attrs: {
						src: fileReader.result,
						loading: true,
						loadingId: id
					}
				})
				.run();
		};

		action.upload(file, id);
	}

	export const action = {
		canOpen: () => editor?.can().setImage({ src: '' }),
		open: () => {
			popoverOpened = false;
			modalOpened = true;
		},
		upload: async (file?: File, tmpImgId?: string) => {
			if ((uploadData.file === undefined || uploadData.file.length === 0) && !file) {
				notify.warning("Can't upload to cloud, no file selected!");
				return;
			}

			if (!editor?.ext?.image || !editor?.ext.image?.upload) {
				notify.warning('No image upload handler defined');
				return;
			}

			uploading = true;

			const formData = new FormData();

			formData.append('file', file ?? uploadData.file![0]);

			if (uploadData.alt) formData.append('alt', uploadData.alt);
			if (uploadData.tags) formData.append('tags', uploadData.tags);

			const data = await editor?.ext.image.upload(formData).finally(() => (uploading = false));

			if (!data?.url) {
				notify.warning('Failed to upload image to server. Try adding again');
				return;
			}

			serverImages = [...[data], ...serverImages];

			action.place({
				src: data.url,
				alt: data.name,
				tmpImgId
			});
		},
		clearFile: () => {
			uploadData = {};

			if (filePicker) {
				filePicker.value = '';
				filePicker.dispatchEvent(new Event('change'));
			}
		},
		close: function () {
			modalOpened = false;
			popoverOpened = false;
			searchQuery = '';
			imageLink = '';
			modalOpened = false;
			popoverOpened = false;
			filteredImages = serverImages;
			selectedImage = undefined;
			hoveredImage = undefined;
			newImage = undefined;
			this.clearFile();
		},
		place: function ({
			src,
			alt,
			tmpImgId
		}: { src?: string; alt?: string; tmpImgId?: string } = {}) {
			//BUG: Make the caret of the user return to the current place the user was while typing so they don't have to deal with jumping editor

			if (!selectedImage?.url && !src) return;

			let chain = editor!.chain().focus();

			if (tmpImgId) chain = chain.setNodeSelection(getTempImg(tmpImgId)!);

			chain
				.setImage({
					src: src ?? selectedImage!.url,
					alt: alt ?? selectedImage?.name,
					title: alt ?? selectedImage?.name,
					width: selectedImage?.width,
					height: selectedImage?.height
				})
				.run();

			this.close();
		}
	};

	export function config() {
		return [
			Image.extend({
				addAttributes() {
					return {
						...this.parent?.(),
						align: { default: 'left' },
						loading: { default: null },
						loadingId: { default: null }
					};
				},
				renderHTML({ HTMLAttributes }) {
					HTMLAttributes = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes);

					const { align, style, loading, loadingId } = HTMLAttributes;

					let computedStyle = style || '';

					if (align === 'center') computedStyle += 'margin:0 auto;';
					else if (align === 'right') computedStyle += 'margin-left:auto;margin-right:0;';
					else computedStyle += 'margin-right:auto;margin-left:0;';

					HTMLAttributes.style = computedStyle;

					delete HTMLAttributes.align;
					// delete HTMLAttributes.width;
					delete HTMLAttributes.loading;
					delete HTMLAttributes.loadingId;

					return [
						'figure',
						{ class: 'editor-img-wrap', loading, id: loadingId },
						['img', HTMLAttributes]
					];
				}
			}).configure({
				HTMLAttributes: {
					class: 'editor-img'
				},
				inline: false,
				allowBase64: false
			}),
			FileHandler.configure({
				allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/heic'],
				onDrop: (currentEditor, files, pos) => {
					files.forEach(async (file) => {
						handleDynamicFile({ file, pos, currentEditor });
						pos++;
					});
				},
				onPaste: (currentEditor, files, htmlContent) => {
					let pos = currentEditor.state.selection.anchor;

					files.forEach((file) => {
						if (htmlContent) {
							// if there is htmlContent, stop manual insertion & let other extensions handle insertion via inputRule
							// you could extract the pasted file from this url string and upload it to a server for example
							//console.log(htmlContent); // eslint-disable-line no-console
							return false;
						}

						handleDynamicFile({
							file,
							pos: pos,
							currentEditor
						});

						pos++;
					});
				}
			})
		];
	}

	export function scanner(editor: Editor) {
		tippyRef?.showOnNode('figure');
	}

	export function slashCommands() {
		return {
			code: {
				title: 'Insert an Image',
				icon: ImageIcon,
				go: () => action.open(),
				keywords: ['image', 'pic', 'picture']
			}
		};
	}

	export const toolbar: ToolbarTool = toolbarBtn;
</script>

{#snippet toolbarBtn()}
	<Popover.Root open={popoverOpened} onOpenChange={(e) => (popoverOpened = !popoverOpened)}>
		<Popover.Trigger title="Add an Image">
			{#snippet child({ props })}
				<Btn variant="ghost" disabled={!action.canOpen()} size="icon" {...props}>
					<ImageIcon class="h-4 w-4" />
				</Btn>
			{/snippet}
		</Popover.Trigger>

		<Popover.Content>
			<form class="flex gap-2">
				<Input placeholder="Link to image..." bind:value={imageLink} />

				<Btn
					variant="outline"
					size="icon"
					onclick={(e) => {
						e.preventDefault();
						action.place({ src: imageLink });
					}}
				>
					<Check />
				</Btn>
			</form>
			<Separator class="my-2 border-accent" />
			<Btn class="w-full" variant="outline" type="button" onclick={() => action.open()}>
				<ToolCase /> More Options
			</Btn>
		</Popover.Content>
	</Popover.Root>
{/snippet}

{#snippet send2Server()}
	<form>
		<Empty.Root class="border border-dashed p-2">
			<Empty.Header>
				<Empty.Media class="h-50 w-50">
					<MediaPreview src={filePicker!} />
				</Empty.Media>
				<Empty.Description>
					<Label class="mb-2">
						<div class="basis-2/4">Alt Text:</div>
						<Input bind:value={uploadData.alt} placeholder="Add alt text for SEO" /></Label
					>
					<Label>
						<div>Tags:</div>
						<Input bind:value={uploadData.tags} placeholder="Comma separated tags" /></Label
					>
				</Empty.Description>
			</Empty.Header>
			<Empty.Content class="flex-row justify-center gap-2">
				<Btn type="button" variant="destructive" onclick={() => action.clearFile()} size="sm"
					>Cancel Upload</Btn
				>
				<Btn type="button" variant="outline" onclick={() => filePicker?.click()} size="sm"
					>Replace Image</Btn
				>
				<Btn
					variant="default"
					loading={uploading}
					loadingText="Uploading..."
					onclick={(e) => {
						e.preventDefault();
						action.upload();
					}}
					size="sm">Upload To Cloud</Btn
				>
			</Empty.Content>
		</Empty.Root>
	</form>
{/snippet}

<BubbleMenu bind:ref={bubbleMenu} class="flex-col">
	<div class="flex items-center gap-1">
		<ToggleBtn
			{editor}
			icon={AlignStartVertical}
			title="Align Start"
			onclick={() => updateAlign('left')}
			isActive={() => imageAlign === 'left'}
		/>

		<ToggleBtn
			{editor}
			icon={AlignCenterVertical}
			title="Align Center"
			onclick={() => updateAlign('center')}
			isActive={() => imageAlign === 'center'}
		/>

		<ToggleBtn
			{editor}
			icon={AlignEndVertical}
			title="Align End"
			onclick={() => updateAlign('right')}
			isActive={() => imageAlign === 'right'}
		/>

		<Separator orientation="vertical" class="mx-1 h-5!" />

		<Slider
			class="w-50"
			type="single"
			bind:value={imageWidth}
			max={100}
			min={10}
			onValueChange={(width) => updateWidth(width)}
			onValueCommit={(width) => {
				updateAttribute({ width: width + '%' });
			}}
		/>
	</div>
	<div>
		<Btn
			variant="ghost"
			title="Alternative Text"
			onclick={() => {
				tippyRef?.hide('selection');
				altTextModalOpened = true;
			}}
		>
			{#if imageAlt}
				<span><SquarePen /></span> {' '} <span>{imageAlt}</span>
			{:else}
				<Captions /> Alt Text
			{/if}
		</Btn>
	</div>
</BubbleMenu>

<Modal title="Image Alt Text" centered bind:open={altTextModalOpened} variant="sm">
	<form class="text-center">
		<Input class="mb-4" bind:value={imageAlt} />

		<Btn
			variant="outline"
			size="icon-lg"
			onclick={(e) => {
				e.preventDefault();
				updateAttribute({ alt: imageAlt });
				tippyRef?.show();
				altTextModalOpened = false;
			}}
			class="w-full"
		>
			<CheckIcon />
		</Btn>
	</form>
</Modal>

<Modal title="Pick an Image" bind:open={modalOpened} centered variant="xl">
	<!-- <Modal title="Pick an Image" open={true} centered variant="xl"> -->
	<input type="file" bind:this={filePicker} bind:files={uploadData.file} accept="image/*" hidden />

	{#if serverImages.length > 0}
		<div class="sticky top-0 z-1 flex gap-2 bg-background pb-3">
			<InputGroup.Root>
				<InputGroup.Input
					placeholder="Search images..."
					oninput={searchImage}
					bind:value={searchQuery}
				/>
				<InputGroup.Addon>
					<SearchIcon />
				</InputGroup.Addon>
			</InputGroup.Root>

			<Btn
				class="relative"
				variant="outline"
				onclick={() => {
					selectedImage = undefined;
					filePicker?.click();
				}}
			>
				<Upload />
				Upload New
			</Btn>
		</div>

		<div class="flex justify-center">
			{#if uploadData.file?.length}
				<div class="mr-5 flex-4 border-r-2 border-r-input pr-5 md:basis-9/10">
					{@render send2Server()}
				</div>
			{/if}

			<!-- Thumbnails -->
			<div class="p-3 pt-0">
				{#if filteredImages.length > 0}
					<div
						class={cn(
							'grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3',
							uploadData.file?.length ? 'xl:grid-cols-3' : 'xl:grid-cols-6',
							uploadData.file?.length ? 'lg:grid-cols-2' : 'lg:grid-cols-3',
							selectedImage ? 'xl:grid-cols-4' : 'xl:grid-cols-6'
						)}
					>
						{#each filteredImages as image}
							<button
								class="relative cursor-pointer overflow-hidden rounded-md p-0 {selectedImage?.id ===
								image.id
									? 'border-2 border-primary'
									: ''}"
								onmouseenter={() => (hoveredImage = image)}
								onmouseleave={() => (hoveredImage = undefined)}
								onclick={() => {
									uploadData = {};
									selectedImage = image;
								}}
							>
								<img
									loading="lazy"
									class="h-full w-full object-cover"
									src={image.url}
									alt={image.name}
								/>
								{#if selectedImage?.id === image.id || hoveredImage?.id === image.id}
									<div
										class="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center bg-black/40"
									>
										<Check />
									</div>
								{/if}
								<div class="absolute right-0 bottom-0 left-0 block bg-black/40 p-3 md:hidden">
									<h3
										class="text-md mx-auto mb-1 overflow-hidden font-semibold text-ellipsis whitespace-nowrap"
									>
										{image.name}
									</h3>
									<span class="ms-auto">{formatSize(image.size)}</span>
								</div>
							</button>
						{/each}
					</div>
				{:else}
					<Empty.Root class="border border-dashed">
						<Empty.Header>
							<Empty.Media variant="icon">
								<CloudIcon />
							</Empty.Media>
							<Empty.Title>Search Result Empty</Empty.Title>
							<Empty.Description>
								No Images found with that search query. Try another or upload from your device
							</Empty.Description>
						</Empty.Header>
					</Empty.Root>
				{/if}
			</div>

			<!-- Big Preview -->
			{#if selectedImage}
				<div class="ml-5 hidden flex-4 border-l-2 border-l-input pl-5 md:block md:basis-9/10">
					<div class="flex flex-col">
						<img
							class="mx-auto mb-2 w-full rounded-md border-2 object-cover"
							src={selectedImage.url}
							alt={selectedImage.name}
						/>
						<h3 class="mx-auto mb-2 text-lg font-semibold">{selectedImage.name}</h3>

						<div class="flex flex-col px-1">
							<div class="mb-2 flex">
								<h4 class="items-center font-bold">Dimensions:</h4>
								<span class="ms-auto">{selectedImage.width} x {selectedImage.height}</span>
							</div>

							<div class="mb-2 flex">
								<h4 class="items-center font-bold">Size:</h4>
								<span class="ms-auto">{formatSize(selectedImage.size)}</span>
							</div>

							<div class="flex flex-wrap justify-end">
								<h4 class="me-auto mb-1 items-center font-bold">Tags:</h4>
								{#each selectedImage.tags as tag}
									<Badge variant="outline" class="ms-1">{tag}</Badge>
								{/each}
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	{:else if uploadData.file?.length}
		{@render send2Server()}
	{:else}
		<Empty.Root class="border border-dashed">
			<Empty.Header>
				<Empty.Media variant="icon">
					<ImagesIcon />
				</Empty.Media>
				<Empty.Title>No Image at the moment</Empty.Title>
				<Empty.Description>
					Upload files to your cloud storage to access in your editor.
				</Empty.Description>
			</Empty.Header>
			<Empty.Content>
				<Btn variant="outline" onclick={() => filePicker?.click()} size="sm">Upload New Image</Btn>
			</Empty.Content>
		</Empty.Root>
	{/if}

	{#snippet footer()}
		{#if serverImages.length > 0}
			<Btn variant="destructive" onclick={() => action.close()}>Cancel</Btn>

			<Btn disabled={!selectedImage} onclick={() => action.place()}>Add Image</Btn>
		{/if}
	{/snippet}
</Modal>
