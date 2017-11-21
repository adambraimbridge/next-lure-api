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

// probably most of the differences between v1 and v2, v3 ... will be small at first
// so can hopefully be encapsulated by some last minute data transformations performed
// before resonding with the data
const v1Transformer = data => data;

const v2ifyItems = obj => {
	return obj.recommendations
		.map(item => {
			item.tracking = obj.tracking;
			return item;
		})
}

const v2Transformer = data => {
	const result = {};
	if (data.rhr) {
		result.rhr = Object.assign(data.rhr, {
			items: v2ifyItems(data.rhr)
		});
		delete result.rhr.recommendations;
	}

	if (data.onward) {
		result.onward = Object.assign(data.onward[0], {
			items: v2ifyItems(data.onward[0]).concat(v2ifyItems(data.onward[1]))
		})
		delete result.onward.recommendations;
	}
	return result;
}

v1.get('/content/:contentId', require('./controllers/content')(v1Transformer));
v2.get('/content/:contentId', require('./controllers/content')(v2Transformer));

lure.use('/v1', v1);
lure.use('/v2', v2);
app.use('/lure', lure);

app.listen(process.env.PORT || 3002);
