/* eslint-disable @typescript-eslint/no-explicit-any */
export type NavItem = {
	title: string;
	url: string;
	alias?: string[];
	icon?: any;
	sub?: NavItem[];
};

export type NavRoutes = {
	group: string;
	items: NavItem[];
}[];
