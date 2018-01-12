const {RIBBON_COUNT} = require('../constants');

module.exports = (content, {locals: {slots}}) => {

	if (!slots.ribbon) {
		return null;
	}

	const response = {};
	const model = {
		title: 'Essential stories related to this article',
		titleHref: '/'
	};

	let allStories = [];

	content._editorialComponents.forEach(component => {
		allStories = allStories.concat(component.stories);
	});

	//avoid stories doesn't have relativeUrl to set n-teaser
	const storiesHaveRelativeUrl = allStories.filter(story => story.type !== 'non-article');

	if (storiesHaveRelativeUrl.length < RIBBON_COUNT) {
		return null;
	}

	response.ribbon = Object.assign({
		items: storiesHaveRelativeUrl.slice(0, RIBBON_COUNT)
			.map(item => {
				item.originator = 'essential-stories';
				return item;
			})
	}, model);

	return response;

};
