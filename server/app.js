const express = require('@financial-times/n-express');

const topStoriesPoller = require('./data-sources/top-stories-poller');
topStoriesPoller.init();

const app = express({
	systemCode: 'next-lure-api',
	withFlags: true,
	healthChecks: []
})

app.get('/__gtg', (req, res) => res.sendStatus(200));

const lure = express.Router();
const v1 = express.Router();

// probably most of the differences between v1 and v2, v3 ... will be small at first
// so can hopefully be encapsulated by some last minute data transformations performed
// before resonding with the data
const v1Transformer = data => data;

v1.get('/content/:contentId', require('./controllers/content')(v1Transformer));

lure.use('/v1', v1);
app.use('/lure', lure);

app.listen(process.env.PORT || 3002);
