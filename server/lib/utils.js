module.exports = {
	dedupeById: (subjects, filters) => {
		return subjects.filter(subject => !filters.find(filter => subject.id === filter.id))
	},
	getTrackablePredicate: concept => {
		const predicate = concept.predicate.split('/').pop();
		return ['about', 'isPrimarilyClassifiedBy'].includes(predicate) ? predicate : 'brand';
	}
};
