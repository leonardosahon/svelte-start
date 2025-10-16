<script lang="ts">
	import WordEditor, { type EditorImage } from '$lib/osai/components/editor';

	import { getMeta } from '$lib/osai/page-meta';

	const pageMeta = getMeta();

	pageMeta.set({
		title: 'Word Editor - Powered by TipTap/ProseMirror'
	});
</script>

<div class="mx-auto max-w-4xl py-12">
	<h1 class="mb-3 text-center text-2xl">Floating Menu</h1>

	<WordEditor
		ext={{
			image: {
				upload: async (formData: FormData) => {
					const res = await fetch('/api/file', {
						body: formData,
						method: 'POST'
					});

					if (!res.ok) {
						throw 'Failed to upload';
					}

					const data = await res.json();

					return data.data satisfies EditorImage;
				}
			},
			toolbar: {
				bubble: {}
			}
		}}
	/>
</div>

<div class="mx-auto max-w-4xl py-12">
	<h1 class="mb-3 text-center text-2xl">Fixed Toolbar Menu</h1>

	<WordEditor
		ext={{
			image: {
				upload: async (formData: FormData) => {
					const res = await fetch('/api/file', {
						body: formData,
						method: 'POST'
					});

					if (!res.ok) {
						throw 'Failed to upload';
					}

					const data = await res.json();

					return data.data satisfies EditorImage;
				}
			}
		}}
	/>
</div>
