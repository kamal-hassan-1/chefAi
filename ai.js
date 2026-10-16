export default async function chefAI(ingredientsArray) {
	try {
		const response = await fetch('/api/recipe', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ ingredients: ingredientsArray }),
		});

		const data = await response.json();
		if (!response.ok) throw new Error(data.error || 'Request failed');
		return data.recipe;
	} catch (error) {
		console.error('Error fetching recipe:', error);
		return "Sorry, I couldn't fetch a recipe at this time.";
	}
}
