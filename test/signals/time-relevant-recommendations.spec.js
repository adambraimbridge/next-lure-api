const chai = require('chai');
const expect = chai.expect;
chai.use(require('sinon-chai'));
const proxyquire = require('proxyquire');

const sinon = require('sinon');
const es = require('@financial-times/n-es-client');
const getRelatedContent = require('../../server/lib/get-related-content')
const topStoriesPoller = require('../../server/data-sources/top-stories-poller');
const { NEWS_CONCEPT_ID } = require('../../server/constants');

describe('time relevant recommendations signal', () => {
	let subject;
	let stubs;
	const defaultResults = {
		esSearch: [{id: 1}, {id: 2}, {id: 6}, {id: 7}],
		topStories: [{id: 'parent-id'}, {id: 1, genreConcept: {id: NEWS_CONCEPT_ID}}, {id: 2, genreConcept: {id: 'not news'}}, {id: 3}],
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
			getMostRelatedConcepts: sinon.stub().callsFake(() => results.concepts),
			getRelatedContent: sinon.spy(getRelatedContent)
		};
		subject = proxyquire('../../server/signals/time-relevant-recommendations', {
			'../lib/get-most-related-concepts': stubs.getMostRelatedConcepts,
			'../lib/get-related-content': stubs.getRelatedContent
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
		}, {slots: {onward: true}, localTimeHour: 10, edition: 'uk'});
		expect(topStoriesPoller.get).calledWith('uk');
	});

	it('can get top stories data for international edition', async () => {
		await subject({
			id: 'parent-id',
			curatedRelatedContent: []
		}, {slots: {onward: true}, localTimeHour: 10, edition: 'international'});
		expect(topStoriesPoller.get).calledWith('international');
	});

	it('abort when no edition', async () => {
		const result = await subject({
			id: 'parent-id',
			curatedRelatedContent: []
		}, {slots: {onward: true}, localTimeHour: 10});
		expect(result).to.be.undefined;
	});

	it('abort when no localTimeHour', async () => {
		const result = await subject({
			id: 'parent-id',
			curatedRelatedContent: []
		}, {slots: {onward: true}, edition: 'uk'});
		expect(result).to.be.undefined;
	});

	it('abort when localTimeHour not a relevant time', async () => {
		const result = await subject({
			id: 'parent-id',
			curatedRelatedContent: []
		}, {slots: {onward: true}, edition: 'uk', localTimeHour: 12});
		expect(result).to.be.undefined;
	});

	context('am', () => {

		let result;
		beforeEach(() => {
			return subject({
				id: 'parent-id',
				curatedRelatedContent: []
			}, {slots: {onward: true, rhr: true}, edition: 'uk', localTimeHour: 10})
				.then(res => result = res);
		});

		it('use top stories news, excluding parent id, for first slot', () => {
			const onward = result.onward[0];
			expect(onward.recommendations).to.eql([{id: 1, genreConcept: {id: NEWS_CONCEPT_ID}}]);
			expect(onward.title).to.equal('This morning\'s news');
			expect(onward.titleHref).to.equal('/');
			expect(onward.tracking).to.equal('morning-reads');
		});

		it('use most related concept news, deduped, in second onward section', () => {
			expect(stubs.getRelatedContent.args[0][3]).to.equal(true);
			expect(result.onward[1].recommendations).to.eql([{id: 2}, {id: 6}, {id: 7}]);
		});

		it('use top stories news, excluding parent id for rhr', () => {
			expect(result.rhr.recommendations).to.eql([{id: 1, genreConcept: {id: NEWS_CONCEPT_ID}}]);
			expect(result.rhr.title).to.equal('This morning\'s news');
			expect(result.rhr.titleHref).to.equal('/');
			expect(result.rhr.tracking).to.equal('morning-reads');
		});
	});

	context('pm', () => {

		let result;
		beforeEach(() => {
			return subject({
				id: 'parent-id',
				curatedRelatedContent: []
			}, {slots: {onward: true, rhr: true}, edition: 'uk', localTimeHour: 19})
				.then(res => result = res);
		});

		it('use top stories news, excluding parent id, for first slot', () => {
			const onward = result.onward[0];
			expect(onward.recommendations).to.eql([{id: 2, genreConcept: {id: 'not news'}}]);
			expect(onward.title).to.equal('Looking back on the day');
			expect(onward.titleHref).to.equal('/');
			expect(onward.tracking).to.equal('evening-reads');
		});

		it('use most related concept news, deduped, in second onward section', () => {
			expect(stubs.getRelatedContent.args[0][3]).to.equal(false);
			expect(result.onward[1].recommendations).to.eql([{id: 1}, {id: 6}, {id: 7}]);
		});

		it('use top stories news, excluding parent id for rhr', () => {
			expect(result.rhr.recommendations).to.eql([{id: 2, genreConcept: {id: 'not news'}}]);
			expect(result.rhr.title).to.equal('Looking back on the day');
			expect(result.rhr.titleHref).to.equal('/');
			expect(result.rhr.tracking).to.equal('evening-reads');
		});
	});
});
