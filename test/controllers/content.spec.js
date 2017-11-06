const chai = require('chai');
const expect = chai.expect;
chai.use(require('sinon-chai'));
const proxyquire = require('proxyquire');

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
	}];
};

describe('content controller', () => {
	let controller;
	let transform;
	let sandbox;
	let signalStubs;
	beforeEach(() => {
		sandbox = sinon.sandbox.create();
		transform = sandbox.stub().callsFake(data => data);
		sandbox.stub(es, 'get').returns(Promise.resolve({
			id: 'content-id'
		}));
		signalStubs = {
			topStories: sandbox.stub().callsFake(async (content, {slots}) => slots),
			relatedContent: sandbox.stub().callsFake(async (content, {slots}) => slots)
		};
		controller = proxyquire('../../server/controllers/content', {
			'../signals': signalStubs
		})(transform);
	});

	afterEach(() => sandbox.restore());

	it('fetch content', async () => {
		const mocks = getMockArgs(sandbox);
		await controller(...mocks);
		expect(es.get).calledWith('content-id');
	});

	it('respond with 404 if no content found', async () => {
		const mocks = getMockArgs(sandbox);
		es.get.throws({status: 404});
		await controller(...mocks);
		expect(mocks[1].status).calledWith(404);
	});

	it('vary on ft-edition header', async () => {
		const mocks = getMockArgs(sandbox);
		await controller(...mocks);
		expect(mocks[1].vary).calledWith('ft-edition');
	});

	it('default choice of slots is rhr & onward', async () => {
		const mocks = getMockArgs(sandbox);
		await controller(...mocks);
		expect(mocks[1].json).calledWith({onward: true, rhr: true});
	});

	it('respond with choice of slots', async () => {
		const mocks = getMockArgs(sandbox);
		mocks[0].query.slots = 'slot1,slot2';
		await controller(...mocks);
		expect(mocks[1].json).calledWith({slot1: true, slot2: true});
	});

	// hard to test, and not 100% it's the behaviour we want anyway
	it('respond with 404 if no recommendations found', async () => {
		const mocks = getMockArgs(sandbox);
		signalStubs = {
			relatedContent: sandbox.stub().callsFake(async () => undefined)
		};
		controller = proxyquire('../../server/controllers/content', {
			'../signals': signalStubs
		})(transform);
		await controller(...mocks);
		expect(mocks[1].status).calledWith(404);
	});

	it('call transformer on data', async () => {
		const mocks = getMockArgs(sandbox);
		await controller(...mocks);
		expect(transform).calledWith({onward: true, rhr: true});
	});

	context('related content', () => {
		it('use related content by default', async () => {
			const mocks = getMockArgs(sandbox);
			await controller(...mocks);
			expect(signalStubs.relatedContent.calledOnce).to.be.true;
			expect(signalStubs.topStories.notCalled).to.be.true;
		});
	});


	context('top stories', () => {
		it('use top stories when lureTopStories flag is on and edition set', async () => {
			const mocks = getMockArgs(sandbox, {'ft-edition': 'uk'});
			mocks[1].locals.flags.lureTopStories = true;
			await controller(...mocks);
			expect(signalStubs.relatedContent.notCalled).to.be.true;
			expect(signalStubs.topStories.calledOnce).to.be.true;
		});

		it('don\'t call top stories when edition unset', async () => {
			const mocks = getMockArgs(sandbox);
			mocks[1].locals.flags.lureTopStories = true;
			await controller(...mocks);
			expect(signalStubs.relatedContent.calledOnce).to.be.true;
			expect(signalStubs.topStories.notCalled).to.be.true;
		});

	});

});
