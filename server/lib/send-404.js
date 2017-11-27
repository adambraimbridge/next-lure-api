module.exports = res => {
	res.set('Surrogate-Control', res.FT_SHORT_CACHE);
	return res.status(404).end();
};
