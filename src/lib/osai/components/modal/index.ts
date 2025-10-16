import { Toaster } from '$lib/components/ui/sonner/index.js';
import { toast, type ToastT } from 'svelte-sonner';
import Modal from './modal-primitive.svelte';
import AlertContainer from './alert-primitive.svelte';
import { type AlertPrimitive, alertState } from './alert-primitive.store';
import NotifyHtml from './multiline-notifier.svelte';

export { Modal, Toaster, AlertContainer };

function getById(id: string): ToastT | undefined {
	return toast.getActiveToasts().find((v) => v.id === id);
}

function multiline({ type, message }: { type: 'warning' | 'success' | 'info'; message: string }) {
	switch (type) {
		default:
			toast.message(NotifyHtml, {
				componentProps: {
					message: message
				}
			});
			break;

		case 'warning':
			toast.warning(NotifyHtml, {
				componentProps: {
					message: message
				}
			});
			break;
	}
}

function confirm({
	title,
	message,
	okText = 'Continue',
	cancelText = 'Cancel',
	onDone,
	closeOnDone = true,
	loading
}: AlertPrimitive) {
	alertState.set({
		open: true,
		title,
		message,
		okText,
		cancelText,
		onDone,
		closeOnDone,
		loading
	});
}

export const notify = Object.assign(toast, {
	getById,
	confirm,
	multiline
});
