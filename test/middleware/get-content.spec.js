const chai = require('chai');
const expect = chai.expect;
chai.use(require('sinon-chai'));

const sinon = require('sinon');
const es = require('@financial-times/n-es-client');

const getMockArgs = (sandbox, headers = {}) => {
	return [{
		get: sandbox.stub().callsFake(key => headers[key]),
		query: {},
		params: {
			contentId: 'content-id'
		}
	}, {
		locals: {
			flags: {}
		},
		FT_NO_CACHE: 'no cache',
		FT_HOUR_CACHE: 'hour cache',
		set: sandbox.stub(),
		vary: sandbox.stub(),
		status: sandbox.stub().returns({end: () => null}),
		json: sandbox.stub()
	}, () => null];
};

describe('get content', () => {
	let middleware;
	let sandbox;
	beforeEach(() => {
		sandbox = sinon.sandbox.create();
		sandbox.stub(es, 'get').returns(Promise.resolve({
			id: 'content-id'
		}));
		middleware = require('../../server/middleware/get-content');
	});

	afterEach(() => sandbox.restore());

	it('fetch content', async () => {
		const mocks = getMockArgs(sandbox);
		await middleware(...mocks);
		expect(es.get).calledWith('content-id');
	});

	it('respond with 404 if no content found', async () => {
		const mocks = getMockArgs(sandbox);
		es.get.throws({status: 404});
		await middleware(...mocks);
		expect(mocks[1].status).calledWith(404);
	});

});
