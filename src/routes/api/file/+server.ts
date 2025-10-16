import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	const data = await request.formData();
	const file = data.get('file');

	//
	// Additional logic
	//

	return json({
		status: 'success',
		code: 200,
		message: 'Image uploaded successfully',
		data: {
			id: 101,
			url: '/placeholder.svg',
			name: data.get('alt') ?? null,
			width: 200,
			height: 200,
			size: 1300,
			tags: data.get('tags') ? (data.get('tags') as string).split(',') : null
		}
	});
}
