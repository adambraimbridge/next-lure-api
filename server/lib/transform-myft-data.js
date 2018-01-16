//These functions come form next-front-page/client/components/myft/v2

const followedConcept = (article, concept = {}) => {
	const followedConcept = Object.assign({}, concept);
	delete followedConcept.latestContent;
	article.followedConcept = followedConcept;

	return article;
};

const removeEmptyConcepts = concept => Boolean(concept.latestContent && concept.latestContent.length);

const flattenConceptsToArticles = (articles, concept) => articles.concat(concept.latestContent);

const removeDuplicateArticles = (articles, article) => {
	const alreadyContainsArticle = articles.find(item => item.id === article.id);

	return alreadyContainsArticle ? articles : articles.concat(article);
};

const removeOldArticles = (article) => {
	const ONE_HOUR = 3600000;
	if (!article.firstPublishedDate) {
		return false;
	}
	const firstPublishedDate = new Date(article.firstPublishedDate);
	if (Number.isNaN(firstPublishedDate.getTime())) {
		return false; // invalid date
	}
	const notBefore = new Date(Date.now() - 48 * ONE_HOUR);
	return firstPublishedDate > notBefore;
};

const orderByDate = (articleOne, articleTwo) => new Date(articleTwo.publishedDate) - new Date(articleOne.publishedDate);

const removeHeadshots = article => {
	(article.authors || []).forEach(author => {
		if (author.headshot) {
			delete author.headshot;
		}
	});
	return article;
};

const extractArticlesFromConcepts = (data) => {

	if (!data.followsConcepts) {
		return data;
	}

	data.followedConcepts.forEach(concept =>
		concept.latestContent = concept.latestContent
			.map((article) => {
				return followedConcept(article, concept);
			}));

	data.articles = data.followedConcepts
		.filter(removeEmptyConcepts)
		.reduce(flattenConceptsToArticles, [])
		.filter(removeOldArticles)
		.reduce(removeDuplicateArticles, [])
		.sort(orderByDate)
		.slice(0, 7)
		.map(removeHeadshots);

	delete data.followedConcepts;

	return data;

};

const doesUserFollowConcepts = (followedConcepts) => {
	return {
		followsConcepts: Boolean(followedConcepts.length),
		followedConcepts
	};
};


module.exports = {
	doesUserFollowConcepts,
	extractArticlesFromConcepts,
	removeOldArticles, /* FIXME - This is exported only for the sake of being unit tested. The unit under test should
	                      instead be `extractArticlesFromConcepts()` and this export should be removed. */
};
