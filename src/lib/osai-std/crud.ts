/* eslint-disable @typescript-eslint/no-explicit-any */
import { notify } from '$lib/components/osai/modal';
import { api } from '$lib/osai-std/api';
import type { ApiResponse } from './api';
import {
	createMutation,
	createQuery,
	type CreateBaseMutationResult,
	type QueryObserverResult
} from '@tanstack/svelte-query';
import type { Readable, Writable } from 'svelte/store';

export type CrudCallback = {
	then?: (response: any) => void;
	always?: () => void;
	isLoading?: Writable<boolean>;
};

export type CrudResult<T = any> = Readable<QueryObserverResult<T, Error>>;

export type EnumOption = {
	id?: string;
	name?: string;
};

type Arg = CrudCallback & {
	endpoint: string;
	isLoading?: Writable<boolean>;
};

function subscribeOp({
	res,
	isLoading,
	then,
	always
}: {
	res: QueryObserverResult<any> | CreateBaseMutationResult<any, any, any, any>;
	isLoading?: Writable<boolean>;
	then: any;
	always: any;
}) {
	if (res.isPending && isLoading) isLoading.set(true);

	if (res.isError || res.isSuccess) {
		if (isLoading) isLoading.set(false);

		if (always) always();

		if (res.isSuccess && then) then(res.data);
	}
}

// --- Queries --- //
export function usePull<T = any>({ endpoint, then, always, isLoading }: Arg) {
	const x = createQuery<T, Error>({
		queryKey: ['pull', endpoint],
		queryFn: async () => {
			const res = await api.get(endpoint);
			return res.data as T;
		}
	});

	x.subscribe((res) => subscribeOp({ res, then, always, isLoading }));

	return x;
}

export function usePullWithMeta<T = any>({ endpoint, then, always, isLoading }: Arg) {
	const x = createQuery<{ data: T; meta: any }, Error>({
		queryKey: ['pullWithMeta', endpoint],
		queryFn: async () => {
			const res = await api.get(endpoint);

			return {
				data: res.data,
				meta: res.meta ?? {}
			};
		}
	});

	x.subscribe((res) => subscribeOp({ res, then, always, isLoading }));

	return x;
}

// --- Mutations --- //
export function usePost<T = any>({
	endpoint,
	op,
	isLoading,
	then,
	always
}: Arg & {
	op: 'new' | 'edit' | 'delete';
}) {
	const x = createMutation<ApiResponse, Error, T>({
		mutationKey: ['post', op, endpoint],
		mutationFn: async (data: any) => {
			switch (op) {
				case 'edit':
					return await api.patch(endpoint, data);
				default:
					return await api.post(endpoint, data);
			}
		}
	});

	x.subscribe((res) =>
		subscribeOp({
			res,
			then: (res: { message?: string }) => {
				if (res?.message) notify.success(res.message);

				if (then) return then(res);
			},
			always,
			isLoading
		})
	);

	return x;
}

export type ConfirmDrop = {
	run: (
		message: string,
		then: (x: CreateBaseMutationResult<ApiResponse, Error, any, unknown>) => void
	) => void;
};

export function useConfirmDrop({ endpoint, isLoading }: Arg): ConfirmDrop {
	const x = createMutation({
		mutationKey: ['confirmDrop', endpoint],
		mutationFn: async (id: string) => await api.del(endpoint + id)
	});

	return {
		run: (
			message: string,
			then: (x: CreateBaseMutationResult<ApiResponse, Error, any, unknown>) => void
		) =>
			notify.confirm({
				message,
				loading: isLoading,
				onDone: async () => {
					x.subscribe((v) => {
						if (v.isIdle) then(v);
						if (v.isSuccess && v.data?.message) notify.success(v.data.message);
					});
				}
			})
	};
}
