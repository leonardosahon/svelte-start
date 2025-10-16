<script lang="ts">
	import WordEditor, { type EditorImage } from '$lib/components/osai/editor';

	import { getMeta } from '$lib/osai-std/page-meta';

		const pageMeta = getMeta();

		pageMeta.set({
			title: 'Word Editor - Powered by TipTap/ProseMirror'
		});
</script>


<div class="mx-auto max-w-4xl py-12">
    <h1 class="text-center text-2xl mb-3">Floating Menu</h1>

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
    <h1 class="text-center text-2xl mb-3">Fixed Toolbar Menu</h1>

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

		}}
	/>
</div>
