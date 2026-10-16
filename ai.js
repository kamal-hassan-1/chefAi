export default async function chefAI(ingredients) {
	const response = await fetch('/api/recipe', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ ingredients }),
	});

	const data = await response.json().catch(() => ({}));
	if (!response.ok) {
		const error = new Error(data.error || 'The recipe request failed.');
		error.code = data.code;
		throw error;
	}
	if (typeof data.recipe !== 'string' || !data.recipe.trim()) {
		const error = new Error('The chef returned an empty recipe.');
		error.code = 'EMPTY_RESPONSE';
		throw error;
	}

	return data.recipe;
}
