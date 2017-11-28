const dedupeById = require('../lib/dedupe-by-id');
const send404 = require('../lib/send-404');

const finishModel = (model, listName, count) => {
	if (!model.concept) {
		return model;
	}

	const listObj = {};

	listObj[listName] = model.items.slice(0, count);

	return Object.assign({}, {
		title: `Latest ${model.concept.preposition} ${model.concept.prefLabel}`,
		titleHref: model.concept.relativeUrl,
		concept: model.concept
	}, listObj);
};

module.exports = (req, res) => {
	if (!res.locals.recommendations) {
		return send404(res);
	}
	const { recommendations, modelTemplate: {listName, onward, ribbon, rhr} } = res.locals;
	const response = {};

	const rhrModel = finishModel(recommendations.rhr, listName, rhr || ribbon);

	if (ribbon) {
		response.ribbon = rhrModel;
	} else {
		response.rhr = rhrModel;
	}

	if (recommendations.onward) {
		const onwardAsArray = Array.isArray(recommendations.onward) ? recommendations.onward : [recommendations.onward];

		if (Array.isArray(onward)) {
			response.onward = [
				finishModel(recommendations.onward[0], listName, onward[0])
			];
			let secondOnward;
			if (onwardAsArray[1]) {
				secondOnward = Object.assign({}, onwardAsArray[1], {
					items: dedupeById(onwardAsArray[1].items, onwardAsArray[0].items)
				})
			} else {
				// deliberately no title
				secondOnward = Object.assign({}, {
					items: onwardAsArray[0].items.slice(onward[0])
				})
			}

			response.onward.push(finishModel(secondOnward, listName, onward[1]));
		} else {
			// todo merge with onward[1]
			if (onwardAsArray[1]) {
				response.onward = finishModel(Object.assign({}, recommendations.onward[0], {
					items: dedupeById(
						recommendations.onward[0].items.slice(0, onward / 2)
							.concat(recommendations.onward[1].items)
					).slice(0, onward)
				}), listName, onward);
			} else {
				response.onward = finishModel(recommendations.onward, listName, onward)
			}
		}
	}

	res.json(response);
};
