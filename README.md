# OSAI Svelte Starter Kit

A comprehensive SvelteKit starter kit with pre-built UI components, rich text editor, and modern tooling for rapid development.

## Features

This starter kit includes:

- **UI Components:** Bits UI library with custom OSAI components (buttons, cards, forms, tables, modals, sidebars, etc.)
- **Styling:** Tailwind CSS with typography plugin, tailwind-merge, and tailwind-variants for utility-first styling
- **Rich Text Editor:** TipTap editor with extensive extensions (tables, images, collaboration, code blocks, lists, etc.)
- **State Management:** TanStack Query for efficient data fetching and caching
- **Forms:** Formsnap with Zod validation and sveltekit-superforms for robust form handling
- **Theming:** Mode-watcher for dark/light theme switching
- **Icons:** Lucide icons for consistent iconography
- **Notifications:** Svelte Sonner for toast notifications
- **Animations:** Tailwind Animate CSS for smooth transitions

## Installation

This project uses pnpm for dependency management. Install dependencies with:

```sh
pnpm install
```

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
