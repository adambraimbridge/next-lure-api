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
		}, {locals: {slots: {onward: true}, edition: 'uk'}, query: {localTimeHour: 10}});
		expect(topStoriesPoller.get).calledWith('uk');
	});

	it('can get top stories data for international edition', async () => {
		await subject({
			id: 'parent-id',
			curatedRelatedContent: []
		}, {locals: {slots: {onward: true}, edition: 'international'}, query: {localTimeHour: 10}});
		expect(topStoriesPoller.get).calledWith('international');
	});

	it('abort when no edition', async () => {
		const result = await subject({
			id: 'parent-id',
			curatedRelatedContent: []
		}, {locals: {slots: {onward: true}}, query: {localTimeHour: 10}});
		expect(result).to.be.undefined;
	});

	it('abort when no localTimeHour', async () => {
		const result = await subject({
			id: 'parent-id',
			curatedRelatedContent: []
		}, {locals: {slots: {onward: true}, edition: 'uk'}, query: {}});
		expect(result).to.be.undefined;
	});

	it('abort when localTimeHour not a relevant time', async () => {
		const result = await subject({
			id: 'parent-id',
			curatedRelatedContent: []
		}, {locals: {slots: {onward: true}, edition: 'uk'}, query: {localTimeHour: 4}});
		expect(result).to.be.undefined;
	});

	context('am', () => {

		let result;
		beforeEach(() => {
			return subject({
				id: 'parent-id',
				curatedRelatedContent: []
			}, {locals: {slots: {onward: true, rhr: true}, edition: 'uk'}, query: {localTimeHour: 9}})
				.then(res => result = res);
		});

		it('use top stories news, excluding parent id, for first slot', () => {
			const onward = result.onward[0];
			expect(onward.items.map(obj => obj.id)).to.eql([1]);
			expect(onward.title).to.equal('Top stories this morning');
			expect(onward.titleHref).to.equal('/');
		});

		it('use most related concept news in second onward section', () => {
			expect(stubs.getRelatedContent.args[0][3]).to.equal(true);
			expect(result.onward[1].items.map(obj => obj.id)).to.eql([1, 2, 6, 7]);
		});

		it('use top stories news, excluding parent id for ribbon', () => {
			expect(result.ribbon.items.map(obj => obj.id)).to.eql([1]);
			expect(result.ribbon.title).to.equal('Top stories this morning');
			expect(result.ribbon.titleHref).to.equal('/');
		});
	});

	context('pm', () => {

		let result;
		beforeEach(() => {
			return subject({
				id: 'parent-id',
				curatedRelatedContent: []
			}, {locals: {slots: {onward: true, ribbon: true}, edition: 'uk'}, query: {localTimeHour: 19}})
				.then(res => result = res);
		});

		it('includes opinion list', () => {
			expect(topStoriesPoller.get).calledWith('ukOpinion');
		});

		it('use top stories news, excluding parent id, for first slot', () => {
			const onward = result.onward[0];
			expect(onward.items.map(obj => obj.id)).to.eql([2]);
			expect(onward.title).to.equal('In-depth insight for the evening');
			expect(onward.titleHref).to.equal('/');
		});

		it('use most related concept news in second onward section', () => {
			expect(stubs.getRelatedContent.args[0][3]).to.equal(false);
			expect(result.onward[1].items.map(obj => obj.id)).to.eql([1, 2, 6, 7]);
		});

		it('use top stories news, excluding parent id for ribbon', () => {
			expect(result.ribbon.items.map(obj => obj.id)).to.eql([2]);
			expect(result.ribbon.title).to.equal('In-depth insight for the evening');
			expect(result.ribbon.titleHref).to.equal('/');
		});
	});
});
