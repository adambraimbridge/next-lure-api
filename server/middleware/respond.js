const dedupeById = require('../lib/dedupe-by-id');
const send404 = require('../lib/send-404');

const finishModel = (model, count) => {
	const listObj = {};

	listObj.items = model.items.slice(0, count);

	if (!model.concept) {
		return Object.assign({}, {
			title: model.title,
			titleHref: model.titleHref
		}, listObj);
	}

	return Object.assign({}, {
		title: `Latest ${model.concept.preposition} ${model.concept.prefLabel}`,
		titleHref: model.concept.relativeUrl,
		concept: model.concept
	}, listObj);
};

module.exports = (req, res) => {
	if (!res.locals.recommendations || !Object.keys(res.locals.recommendations).length) {
		return send404(res);
	}
	const { recommendations, modelTemplate: {onward, ribbon, rhr} } = res.locals;
	const response = {};

	const ribbonModel = finishModel(recommendations.ribbon, rhr || ribbon);
	if (recommendations.ribbon) {
		if (ribbon) {
			response.ribbon = ribbonModel;
		} else {
			response.rhr = ribbonModel;
		}
	}

	if (recommendations.onward) {
		const onwardAsArray = Array.isArray(recommendations.onward) ? recommendations.onward : [recommendations.onward];

		// todo merge with onward[1]
		if (onwardAsArray[1]) {
			response.onward = finishModel(Object.assign({}, recommendations.onward[0], {
				items: dedupeById(
					recommendations.onward[0].items.slice(0, onward / 2)
						.concat(recommendations.onward[1].items)
				).slice(0, onward)
			}), onward);
		} else {
			response.onward = finishModel(onwardAsArray[0], onward)
		}
	}

	res.json(response);
};
