import { ArrowRight } from '@lucide/svelte';
import {
	findChildren,
	findParentNode,
	mergeAttributes,
	Node,
	wrappingInputRule
} from '@tiptap/core';
import { mount } from 'svelte';
import RenderIcon from '../../utils/render-icon.svelte';
import type { NodeMarkdownStorage } from '../extensions/markdown';
import { setAttributes } from '../utils/editor';

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		details: {
			setDetails: () => ReturnType;
			unsetDetails: () => ReturnType;
			toggleDetails: () => ReturnType;
		};
	}
}

export interface DetailsOptions {
	persist: boolean;
	HTMLAttributes: Record<string, any>;
	dictionary: {
		name: string;
	};
}

const isOpen = (open: any) => open || open === '' || open === 'true';

export const Details = Node.create<DetailsOptions>({
	name: 'details',
	group: 'block',
	content: 'detailsSummary detailsContent',
	defining: true,
	isolating: true,
	allowGapCursor: true,
	addOptions() {
		return {
			persist: false,
			HTMLAttributes: {},
			dictionary: {
				name: 'Details'
			}
		};
	},
	addStorage() {
		return {
			markdown: {
				parser: {
					match: (node) => node.type === 'containerDirective' && node.name === this.name,
					apply: (state, node, type) => {
						state.openNode(type, node.attributes).next(node.children).closeNode();
					}
				},
				serializer: {
					match: (node) => node.type.name === this.name,
					apply: (state, node) => {
						state
							.openNode({
								type: 'containerDirective',
								name: this.name,
								attributes: node.attrs
							})
							.next(node.content)
							.closeNode();
					}
				}
			}
		} satisfies NodeMarkdownStorage;
	},
	addAttributes() {
		return {
			open: {
				default: true,
				parseHTML: (e) => isOpen(e.getAttribute('open')),
				renderHTML: (a) => (isOpen(a.open) ? { open: '' } : {})
			}
		};
	},
	parseHTML() {
		return [
			{
				tag: 'details'
			}
		];
	},
	renderHTML({ HTMLAttributes }) {
		return ['details', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
	},
	addNodeView() {
		return ({ node, editor, getPos }) => {
			const dom = document.createElement('div');
			const div = document.createElement('div');

			for (const [key, value] of Object.entries(mergeAttributes(this.options.HTMLAttributes))) {
				if (value !== undefined && value !== null) {
					dom.setAttribute(key, value);
				}
			}

			dom.setAttribute('data-type', this.name);
			div.setAttribute('data-type', `${this.name}Container`);

			if (isOpen(node.attrs.open)) {
				dom.setAttribute('open', 'true');
			} else {
				dom.removeAttribute('open');
			}

			mount(RenderIcon, {
				target: dom,
				props: {
					icon: ArrowRight,
					type: `${this.name}Button`,
					onclick: () => {
						const open = !dom.hasAttribute('open');

						if (open) {
							dom.setAttribute('open', 'true');
						} else {
							dom.removeAttribute('open');
						}

						if (editor.isEditable) {
							setAttributes(editor, getPos as () => number, { ...node.attrs, open });
						}
					}
				}
			});

			dom.append(div);

			return {
				dom,
				contentDOM: div,
				update: (updatedNode) => {
					if (updatedNode.type.name !== this.type.name) {
						return false;
					}

					if (isOpen(updatedNode.attrs.open)) {
						dom.setAttribute('open', 'true');
					} else {
						dom.removeAttribute('open');
					}

					return true;
				}
			};
		};
	},
	addCommands() {
		return {
			setDetails: () => {
				return ({ state, chain }) => {
					const range = state.selection.$from.blockRange(state.selection.$to);
					if (!range) {
						return false;
					}

					const slice = state.doc.slice(range.start, range.end);
					if (!state.schema.nodes.detailsContent.contentMatch.matchFragment(slice.content)) {
						return false;
					}

					return chain()
						.insertContentAt(
							{
								from: range.start,
								to: range.end
							},
							{
								type: this.name,
								attrs: {
									open: true
								},
								content: [
									{
										type: 'detailsSummary'
									},
									{
										type: 'detailsContent',
										content: slice.toJSON()?.content ?? []
									}
								]
							}
						)
						.setTextSelection(range.start + 2)
						.run();
				};
			},
			unsetDetails: () => {
				return ({ state, chain }) => {
					const parent = findParentNode((node) => node.type === this.type)(state.selection);
					if (!parent) {
						return false;
					}

					const summary = findChildren(parent.node, (node) => node.type.name === 'detailsSummary');
					const content = findChildren(parent.node, (node) => node.type.name === 'detailsContent');
					if (!summary.length || !content.length) {
						return false;
					}

					const range = { from: parent.pos, to: parent.pos + parent.node.nodeSize };
					const defaultType = state.doc.resolve(range.from).parent.type.contentMatch.defaultType;
					return chain()
						.insertContentAt(range, [
							defaultType?.create(null, summary[0].node.content).toJSON(),
							...(content[0].node.content.toJSON() ?? [])
						])
						.setTextSelection(range.from + 1)
						.run();
				};
			},
			toggleDetails: () => {
				return ({ state, chain }) => {
					const node = findParentNode((node) => node.type === this.type)(state.selection);
					if (node) {
						return chain().unsetDetails().run();
					} else {
						return chain().setDetails().run();
					}
				};
			}
		};
	},
	addInputRules() {
		return [
			wrappingInputRule({
				find: /^:::details\s$/,
				type: this.type
			})
		];
	},
	addKeyboardShortcuts() {
		return {
			'Mod-Alt-d': () => this.editor.commands.toggleDetails()
		};
	}
});
