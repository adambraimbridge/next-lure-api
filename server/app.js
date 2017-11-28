const express = require('@financial-times/n-express');

const topStoriesPoller = require('./data-sources/top-stories-poller');
topStoriesPoller.init();

const healthchecks = require('./healthchecks');
healthchecks.init();

const app = express({
	systemCode: 'next-lure-api',
	withFlags: true,
	healthChecks: healthchecks.checks
});

app.get('/__gtg', (req, res) => res.sendStatus(200));

const lure = express.Router();
const v1 = express.Router();
const v2 = express.Router();

const middlewareStack = [
	require('./middleware/handle-options'),
	require('./middleware/construct-query-lengths'),
	require('./middleware/cache'),
	require('./middleware/get-content'),
	require('./middleware/get-recommendations'),
	require('./middleware/respond')
];

v1.get('/content/:contentId', (req, res, next) => {
	res.locals.modelTemplate = {
		rhr: 5,
		onward: [3, 3]
	};
	next();
}, middlewareStack);

v2.get('/content/:contentId', (req, res, next) => {
	res.locals.modelTemplate = {
		ribbon: 5,
		onward: 8
	};
	next();
}, middlewareStack);

lure.use('/v1', v1);
lure.use('/v2', v2);
app.use('/lure', lure);

app.listen(process.env.PORT || 3002);
