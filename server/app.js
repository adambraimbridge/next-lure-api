const express = require('@financial-times/n-express');

const app = express({
	systemCode: 'next-lure-api'
})

const lure = express.router();

lure.get('/content')

app.use('/lure', lure);

app.listen();
