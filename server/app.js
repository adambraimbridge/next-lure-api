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

const trackifyItems = obj => {
	return obj.recommendations
		.map(item => {
			item.originator = obj.tracking;
			return item;
		})
}

const v1Transformer = data => {
	const result = {};
	if (data.rhr) {
		result.rhr = Object.assign(data.rhr, {recommendations: trackifyItems(data.rhr)});
	}

	if (data.onward) {
		result.onward = data.onward.map(item => {
			item.recommendations = trackifyItems(item);
			return item;
		});
	}
	return result;
}

const v2Transformer = data => {
	const result = {};
	if (data.rhr) {
		result.rhr = Object.assign({}, data.rhr, {
			items: trackifyItems(data.rhr)
		});
		delete result.rhr.recommendations;
	}

	if (data.onward) {
		result.onward = Object.assign({}, data.onward[0], {
			items: trackifyItems(data.onward[0]).concat(trackifyItems(data.onward[1]))
		});
		delete result.onward.recommendations;
	}
	return result;
}

v1.get('/content/:contentId', require('./controllers/content')(v1Transformer));

v2.use((req, res, next) => {
	req.query.onwardRowItemCount = req.query.onwardRowItemCount || 4;
	next();
});

v2.get('/content/:contentId', require('./controllers/content')(v2Transformer));

lure.use('/v1', v1);
lure.use('/v2', v2);
app.use('/lure', lure);

app.listen(process.env.PORT || 3002);
