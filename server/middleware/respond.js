const send404 = require('../lib/send-404');

const finishModel = (model) => {
	const listObj = {};

	listObj.items = model.items.slice();

	if (!model.concept) {
		return Object.assign({}, {
			title: model.title,
			titleHref: model.titleHref
		}, listObj);
	}

	return Object.assign({}, {
		title:  model.title || `Latest ${model.concept.preposition} ${model.concept.prefLabel}`,
		titleHref:  model.titleHref || model.concept.relativeUrl,
		concept: model.concept
	}, listObj);
};

module.exports = (req, res) => {
	if (!res.locals.recommendations || !Object.keys(res.locals.recommendations).length) {
		return send404(res);
	}

	const { recommendations } = res.locals;
	const response = {};

	if (recommendations.ribbon) {
		response.ribbon = finishModel(recommendations.ribbon);
	}

	if (recommendations.onward) {
		response.onward = finishModel(recommendations.onward)
	}

	res.json(response);
};
