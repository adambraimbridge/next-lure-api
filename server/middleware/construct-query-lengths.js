module.exports = (req, res, next) => {
	res.locals.q1Length = res.locals.modelTemplate.rhr || res.locals.modelTemplate.ribbon;
	if (Array.isArray(res.locals.modelTemplate.onward)) {
		res.locals.q2Length = res.locals.modelTemplate.onward[0] + res.locals.modelTemplate.onward[1]
	} else {
		res.locals.q2Length = res.locals.modelTemplate.onward;
	}
	next();
}
