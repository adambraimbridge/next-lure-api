const {expect} = require('chai');
const request = require('supertest-as-promised');
const sinon = require('sinon');
const middleware = require('../server/middleware');

describe.only('lure e2e', () => {
	let rawData = {};
	let app;
	before(() => {
		sinon.stub(middleware, 'getContent').callsFake((req, res, next) => next());
		sinon.stub(middleware, 'getRecommendations').callsFake((req, res, next) => {
			res.locals.recommendations = rawData;
			next()
		});
		app = require('../server/app');
	});

	after(() => {
		middleware.getContent.restore();
		middleware.getRecommendations.restore();
	})

	it('vary on flags and ft-edition header', async () => {
		return request(app)
			.get('/lure/v1/content/uuid')
			.expect('Vary', 'ft-flags, ft-edition')
	});

	it('404 for no recommendations', async () => {
		return request(app)
			.get('/lure/v1/content/uuid')
			.expect(404);
	});

	it('sets appropriate cache headers for 404', async () => {
		return request(app)
			.get('/lure/v1/content/uuid')
			.expect('Cache-Control', 'max-age=0, no-cache, no-store, must-revalidate')
			.expect('Surrogate-Control', 'max-age=600, stale-while-revalidate=60, stale-if-error=86400');
	});

	context('success', () => {
		before(() => rawData = {rhr: {}})
		it('sets appropriate cache headers', async () => {
			return request(app)
				.get('/lure/v1/content/uuid')
				.expect('Cache-Control', 'max-age=0, no-cache, no-store, must-revalidate')
				.expect('Surrogate-Control', 'max-age=3600, stale-while-revalidate=60, stale-if-error=86400');
		});
	})





	// it('default choice of slots is rhr & onward', async () => {
	// 	const mocks = getMockArgs(sandbox);
	// 	await controller(...mocks);
	// 	expect(mocks[1].json).calledWith({onward: true, rhr: true});
	// });

	// it('respond with choice of slots', async () => {
	// 	const mocks = getMockArgs(sandbox);
	// 	mocks[0].query.slots = 'slot1,slot2';
	// 	await controller(...mocks);
	// 	expect(mocks[1].json).calledWith({slot1: true, slot2: true});
	// });

})
// calls middleware in order
// fetches content
