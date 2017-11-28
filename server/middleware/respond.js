module.exports = (req, res, next) => {
	if (!res.locals.recommendations) {
		return send404(res);
	}



	res.json(res.locals.recommendations);
};
