const chai = require('chai');
const expect = chai.expect;
chai.use(require('sinon-chai'));
const proxyquire = require('proxyquire');

const sinon = require('sinon');
const es = require('@financial-times/n-es-client');
const topStoriesPoller = require('../../server/data-sources/top-stories-poller');

describe('top-stories signal', () => {
	let subject;
	let stubs;
	const defaultResults = {
		esSearch: [{id: 1}, {id: 6}, {id: 7}, {id: 8}],
		topStories: [{id: 'parent-id'}, {id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}],
		concepts: [{
			predicate: 'http://www.ft.com/ontology/annotation/about',
			id: 0
		}]
	};
	let results;

	beforeEach(() => {
		results = Object.assign({}, defaultResults);
		sinon.stub(es, 'search').callsFake(() => Promise.resolve(results.esSearch));
		sinon.stub(topStoriesPoller, 'get').callsFake(() => results.topStories);
		stubs = {
			getMostRelatedConcepts: sinon.stub().callsFake(() => results.concepts)
		};
		subject = proxyquire('../../server/signals/top-stories', {
			'../lib/get-most-related-concepts': stubs.getMostRelatedConcepts
		});
	});

	afterEach(() => {
		es.search.restore();
		topStoriesPoller.get.restore();
	});

	it('can get top stories data for uk edition', async () => {
		await subject({
			id: 'parent-id',
			curatedRelatedContent: []
		}, {slots: {onward: true}, edition: 'uk'});
		expect(topStoriesPoller.get).calledWith('uk');
	});

	it('can get top stories data for international edition', async () => {
		await subject({
			id: 'parent-id',
			curatedRelatedContent: []
		}, {slots: {onward: true}, edition: 'international'});
		expect(topStoriesPoller.get).calledWith('international');
	});

	context('onward slot', () => {
		let result;
		beforeEach(() => {
			return subject({
				id: 'parent-id',
				curatedRelatedContent: []
			}, {slots: {onward: true}, edition: 'uk'})
				.then(res => result = res);
		});

		it('use top stories data, excluding parent id, for first slot', () => {
			const onward = result.onward[0];
			expect(onward.recommendations).to.eql([{id: 1}, {id: 2}, {id: 3}]);
			expect(onward.title).to.equal('More from the front page');
			expect(onward.titleHref).to.equal('/');
			expect(onward.tracking).to.equal('top-stories');
		});

		it('use most related concept, deduped, in second onward section', () => {
			expect(result.onward[1].recommendations).to.eql([{id: 6}, {id: 7}, {id: 8}]);
		});

	});

	context('rhr slot', () => {
		let result;
		beforeEach(() => {
			return subject({
				id: 'parent-id',
				curatedRelatedContent: []
			}, {slots: {rhr: true}, edition: 'uk'})
				.then(res => result = res);
		});

		it('use top stories data, excluding parent id', () => {
			expect(result.rhr.recommendations).to.eql([{id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}]);
			expect(result.rhr.title).to.equal('More from the front page');
			expect(result.rhr.titleHref).to.equal('/');
			expect(result.rhr.tracking).to.equal('top-stories');
		});

	});

});
