export default function IngredientList({ ingredients, onRemove }) {
	if (!ingredients.length) {
		return (
			<div className="pantry-empty">
				<span className="pantry-empty-icon" aria-hidden="true">＋</span>
				<span>Your ingredient list will show up here.</span>
			</div>
		);
	}

	return (
		<div className="ingredient-list-section">
			<div className="list-heading">
				<h3>In your pantry <span>({ingredients.length})</span></h3>
				<span className="list-instruction">Tap × to remove</span>
			</div>
			<ul className="ingredient-chips">
				{ingredients.map((ingredient) => (
					<li className="ingredient-chip" key={ingredient}>
						<span>{ingredient}</span>
						<button type="button" onClick={() => onRemove(ingredient)} aria-label={`Remove ${ingredient}`}>
							<span aria-hidden="true">×</span>
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}
