import { useEffect, useRef, useState } from 'react';
import IngredientList from './components/IngredientList';
import Recipe from './components/Recipe';
import chefAI from '../ai';

const QUICK_ADDS = ['eggs', 'spinach', 'chickpeas', 'parmesan', 'tomatoes'];
const MAX_INGREDIENTS = 12;

function getFriendlyError(error) {
	if (error.code === 'RATE_LIMIT') {
		return 'The chef is on a tiny free-plan break. Give it a little while, then try again.';
	}
	if (error.code === 'CONFIGURATION') {
		return 'The kitchen is missing its API key. The project owner needs to check the server settings.';
	}
	if (error.code === 'INVALID_INPUT') {
		return 'That ingredient list confused the pantry. Please edit it and try again.';
	}
	if (!navigator.onLine) {
		return 'The kitchen signal dropped. Reconnect to the internet and give it another go.';
	}
	return 'The chef dropped the ladle. Try again in a moment.';
}

export default function Main() {
	const [ingredients, setIngredients] = useState([]);
	const [draft, setDraft] = useState('');
	const [feedback, setFeedback] = useState('');
	const [recipe, setRecipe] = useState('');
	const [recipeError, setRecipeError] = useState('');
	const [loading, setLoading] = useState(false);
	const recipeRef = useRef(null);

	useEffect(() => {
		if (recipe) recipeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}, [recipe]);

	const addIngredient = (value = draft) => {
		const ingredient = value.trim().replace(/\s+/g, ' ');
		if (!ingredient) {
			setFeedback('Type an ingredient first. The chef is talented, but not psychic.');
			return;
		}
		if (ingredient.length > 50) {
			setFeedback('Keep each ingredient under 50 characters. This is a pantry, not a novel.');
			return;
		}
		if (ingredients.some((item) => item.toLowerCase() === ingredient.toLowerCase())) {
			setFeedback(`${ingredient} is already on the list. We have excellent memory for snacks.`);
			return;
		}
		if (ingredients.length >= MAX_INGREDIENTS) {
			setFeedback(`That is a very full pantry. The limit is ${MAX_INGREDIENTS} ingredients.`);
			return;
		}

		setIngredients((current) => [...current, ingredient]);
		setDraft('');
		setFeedback(`${ingredient} added. Nice choice.`);
		setRecipe('');
		setRecipeError('');
	};

	const handleAdd = (event) => {
		event.preventDefault();
		addIngredient();
	};

	const removeIngredient = (ingredientToRemove) => {
		setIngredients((current) => current.filter((ingredient) => ingredient !== ingredientToRemove));
		setRecipe('');
		setRecipeError('');
		setFeedback(`${ingredientToRemove} removed. No hard feelings.`);
	};

	const generateRecipe = async () => {
		if (ingredients.length < 3 || loading) return;
		setLoading(true);
		setRecipe('');
		setRecipeError('');
		try {
			setRecipe(await chefAI(ingredients));
		} catch (error) {
			setRecipeError(getFriendlyError(error));
		}	finally {
			setLoading(false);
		}
	};

	const resetPantry = () => {
		setIngredients([]);
		setDraft('');
		setRecipe('');
		setRecipeError('');
		setFeedback('Fresh start. What are we working with?');
	};

	const quickAdds = QUICK_ADDS.filter(
		(item) => !ingredients.some((ingredient) => ingredient.toLowerCase() === item.toLowerCase()),
	).slice(0, Math.max(0, MAX_INGREDIENTS - ingredients.length));

	return (
		<main className="page-shell">
			<section className="hero" aria-labelledby="page-title">
				<div className="hero-copy">
					<p className="eyebrow"><span className="eyebrow-dot" /> YOUR LITTLE KITCHEN SIDEKICK</p>
					<h1 id="page-title">Good food starts with <em>what you have.</em></h1>
					<p className="hero-description">
						A few ingredients, a little imagination, and dinner is suddenly handled.
					</p>
				</div>
				<div className="hero-stamp" aria-hidden="true">
					<div className="stamp-sun" />
					<span className="stamp-leaf stamp-leaf-one">✳</span>
					<span className="stamp-leaf stamp-leaf-two">✦</span>
					<div className="stamp-plate"><span>made<br />with<br /><b>what’s<br />here</b></span></div>
				</div>
			</section>

			<div className="studio-grid">
				<section className="pantry-card" aria-labelledby="pantry-title">
					<div className="panel-heading">
						<div>
							<p className="section-kicker">STEP 01 <span>·</span> THE PANTRY</p>
							<h2 id="pantry-title">What’s on hand?</h2>
						</div>
						<span className="ingredient-count" aria-label={`${ingredients.length} of ${MAX_INGREDIENTS} ingredients`}>
							{String(ingredients.length).padStart(2, '0')}<i> / {MAX_INGREDIENTS}</i>
						</span>
					</div>

					<form className="ingredient-form" onSubmit={handleAdd}>
						<label className="sr-only" htmlFor="ingredient-input">Add an ingredient</label>
						<input
							id="ingredient-input"
							className="ingredient-input"
							name="ingredient"
							value={draft}
							onChange={(event) => setDraft(event.target.value)}
							placeholder="e.g. a lonely sweet potato"
							maxLength={60}
							autoComplete="off"
						/>
						<button className="add-button" type="submit" aria-label="Add ingredient">
							<span aria-hidden="true">+</span><span>Add</span>
						</button>
					</form>
					<p className="field-hint">Press Enter or tap Add. Keep it simple: one ingredient at a time.</p>
					<div className="quick-adds" aria-label="Quick add suggestions">
						<span className="quick-label">QUICK ADD</span>
						{quickAdds.map((item) => (
							<button key={item} type="button" className="suggestion-chip" onClick={() => addIngredient(item)}>
								+ {item}
							</button>
						))}
					</div>
					<p className="feedback-line" aria-live="polite">{feedback || 'Start with whatever needs using up.'}</p>

					<div className="ingredient-list-wrap">
						<IngredientList ingredients={ingredients} onRemove={removeIngredient} />
					</div>

					<div className="pantry-footer">
						<div className="unlock-copy">
							<span className="unlock-icon" aria-hidden="true">✳</span>
							<div>
								<strong>{ingredients.length >= 3 ? 'Recipe time.' : `${3 - ingredients.length} more to unlock`}</strong>
								<span>{ingredients.length >= 3 ? 'Your ingredients are ready for their glow-up.' : 'Add at least 3 ingredients to get cooking.'}</span>
							</div>
						</div>
						<button
							className="generate-button"
							type="button"
							onClick={generateRecipe}
							disabled={ingredients.length < 3 || loading}
						>
							{loading ? <><span className="button-spinner" /> Cooking…</> : <>Find my recipe <span aria-hidden="true">↗</span></>}
						</button>
						{ingredients.length > 0 && <button className="reset-button" type="button" onClick={resetPantry}>Clear pantry</button>}
					</div>
				</section>

				<section className="recipe-stage" ref={recipeRef} aria-label="Recipe results" aria-live="polite">
					{loading ? (
						<div className="empty-recipe loading-card">
							<div className="loading-orbit"><span>✳</span></div>
							<p className="section-kicker">A LITTLE KITCHEN MAGIC</p>
							<h2>Let’s see what’s cooking.</h2>
							<p>Our chef is turning your ingredients into something delicious.</p>
							<div className="loading-progress"><span /></div>
						</div>
					) : recipe ? (
						<Recipe recipe={recipe} />
					) : recipeError ? (
						<div className="empty-recipe error-card" role="alert">
							<div className="empty-icon error-icon" aria-hidden="true">!</div>
							<p className="section-kicker">A SMALL KITCHEN DETOUR</p>
							<h2>{recipeError}</h2>
							<button className="retry-button" type="button" onClick={generateRecipe}>Try again <span aria-hidden="true">↗</span></button>
						</div>
					) : (
						<div className="empty-recipe">
							<div className="plate-illustration" aria-hidden="true">
								<div className="plate-ring"><span className="plate-herb herb-one">✿</span><span className="plate-herb herb-two">✦</span><span className="plate-herb herb-three">✳</span><div className="plate-center">A pinch<br />of this,<br /><em>a bit of that.</em></div></div>
							</div>
							<p className="section-kicker">STEP 02 <span>·</span> THE GOOD PART</p>
							<h2>Your next favorite<br />meal goes here.</h2>
							<p>Add three ingredients and we’ll find them a delicious purpose.</p>
							<div className="recipe-note"><span aria-hidden="true">✳</span> No judgment about the half-used jar in the fridge.</div>
						</div>
					)}
				</section>
			</div>

			<footer className="page-footer">
				<span>MADE FOR REAL-LIFE FRIDGES</span>
				<span>Good things can come from leftovers <i>✳</i></span>
			</footer>
		</main>
	);
}
