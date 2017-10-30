module.exports = {
	TEASER_PROPS: [
		'id',

		'relativeUrl',
		'title',
		'alternativeTitles.promotionalTitle',

		'publishedDate',
		'firstPublishedDate',

		'isEditorsChoice',
		'isPremium',
		'canBeSyndicated',

		'mainImage.title',
		'mainImage.description',
		'mainImage.url',
		'mainImage.width',
		'mainImage.height',
		'mainImage.ratio',

		'displayConcept.id',
		'displayConcept.prefLabel',
		'displayConcept.relativeUrl',
		'displayConcept.directType',

		'brandConcept.id',
		'brandConcept.prefLabel',
		'brandConcept.relativeUrl',
		'brandConcept.directType',

		'authorConcepts.id',
		'authorConcepts.prefLabel',
		'authorConcepts.relativeUrl',
		'authorConcepts.directType',

		// in next-api isOpinion = !!annotations && annotations.some(({ id } = {}) => id === 'e569e23b-0c3e-3d20-8ed0-4c17b8177c05');
		// after section migration is done we can probably check for a genre
		// just leaving this here for now as a reminder of why blue-ing opinion articles doesn't work (yet)
		// isOpinion
		'genreConcept.id',
		'genreConcept.prefLabel',
		'genreConcept.relativeUrl',
		'genreConcept.directType'
	]
};
