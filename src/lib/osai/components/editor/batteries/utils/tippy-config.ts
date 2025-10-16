import { debounce } from '$lib/osai/operations';
import tippy, { hideAll, type Instance, type Props } from 'tippy.js';
import type { WeEditor } from '../../core.svelte';

export class TippyConfig {
	private editor: WeEditor;

	public ref: Instance<Props>;
	public currentNode: Node | null = null;
	static showingSelection = false;
	static showingNode = false;

	constructor({ editor, menu }: { editor: WeEditor; menu: HTMLElement }) {
		this.editor = editor;

		this.ref = tippy(editor?.element!, {
			content: menu,
			arrow: false,
			inertia: true,
			hideOnClick: false,
			trigger: 'manual',
			placement: 'top',
			animation: 'shift-away',
			duration: [200, null],
			appendTo: document.body,
			interactive: true,
			maxWidth: 'none'
		});
	}

	showOnNode(nodeName: HTMLElement['nodeName']) {
		const editor = this.editor;

		this.currentNode = editor.view.nodeDOM(editor.state.selection.from) as HTMLElement;

		if (!this.currentNode || this.currentNode.nodeName !== nodeName.toUpperCase()) {
			TippyConfig.showingNode = false;
			this.hide('node');
			return;
		}

		const pos = editor.view.posAtDOM(this.currentNode, 0);
		const coords = editor.view.coordsAtPos(pos);

		this.ref?.setProps({
			getReferenceClientRect: () =>
				new DOMRect(coords.left, coords.top, coords.right - coords.left, coords.bottom - coords.top)
		});

		TippyConfig.showingNode = true;
		this.show();
	}

	/**
	 * Show a bubble menu for selection
	 * @returns void
	 */
	showOnSelection() {
		const { from, to, empty } = this.editor.state.selection;

		if (TippyConfig.showingNode) return;

		if (empty) {
			this.hide('selection');
			return;
		}

		debounce(() => {
			const editor = this.editor;
			const start = editor.view.coordsAtPos(from);

			// Wrap in a try-catch to catch annoying out of range error when user deletes a selection
			try {
				const end = editor.view.coordsAtPos(to);

				// Selection rectangle
				const left = Math.min(start.left, end.left);
				const right = Math.max(start.right, end.right);
				const top = Math.min(start.top, end.top);
				const bottom = Math.max(start.bottom, end.bottom);

				const width = right - left;
				const height = bottom - top;

				this.ref?.setProps({
					getReferenceClientRect: () => new DOMRect(left, top, width, height)
				});

				TippyConfig.showingSelection = true;
				this.show();
			} catch (e) {
				this.hide('selection');
			}
		}, 300);
	}

	show() {
		hideAll({ exclude: this.ref });
		this.ref?.show();
	}

	hide(type: 'selection' | 'node') {
		if (type === 'node') {
			TippyConfig.showingNode = false;
		}

		if (type === 'selection') {
			TippyConfig.showingSelection = false;
		}

		this.ref?.hide();
	}

	destroy() {
		if (this.ref) this.ref.destroy();
	}
}
