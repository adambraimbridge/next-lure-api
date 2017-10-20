const express = require('@financial-times/n-express');

const app = express({
	systemCode: 'next-lure-api'
})


const lure = express.Router();
const v1 = express.Router();

v1.get('/content/:contentId', require('./v1/controllers/content'))

lure.use('/v1', v1);
app.use('/lure', lure);


app.listen(process.env.PORT || 3002);
