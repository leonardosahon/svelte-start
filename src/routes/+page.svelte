<script lang="ts">
	import WordEditor, { type EditorImage } from '$lib/components/osai/editor';

	import { getMeta } from '$lib/osai-std/page-meta';

		const pageMeta = getMeta();

		pageMeta.set({
			title: 'Starter Kit for My Projects'
		});
</script>


<div class="mx-auto max-w-4xl py-12">
	<a class="list-item" href="/editor"> Text Editor </a>
</div>

<style>
    @reference "../app.css";

    .list-item {
        @apply underline text-lg;
    }
</style>
