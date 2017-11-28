module.exports = (req, res, next) => {
	res.locals.slots = req.query.slots ? req.query.slots.split(',')
		.reduce((map, key) => {
			map[key] = true;
			return map;
		}, {}) : {'rhr': true, 'onward': true};

	res.locals.edition = ['uk', 'international'].includes(req.get('ft-edition')) ? req.get('ft-edition') : undefined;

	next();
};
