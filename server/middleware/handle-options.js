module.exports = (req, res, next) => {
	res.locals.slots = req.query.slots ? req.query.slots.split(',')
		.reduce((map, key) => {
			map[key] = true;
			return map;
		}, {}) : {'ribbon': true, 'onward': true};

	res.locals.edition = ['uk', 'international'].includes(req.get('ft-edition')) ? req.get('ft-edition') : undefined;
	res.locals.userId = req.query.userId;
	res.locals.secureSessionToken = req.get('FT-Session-s-Token') || req.cookies.FTSession_s;
	res.locals.teaserFormat = req.query.format ? req.query.format : 'n';

	next();
};
