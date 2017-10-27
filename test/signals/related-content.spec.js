const chai = require('chai');
const expect = chai.expect;
chai.use(require('sinon-chai'));
const proxyquire = require('proxyquire');

const fetchMock = require('fetch-mock');
const sinon = require('sinon');
const es = require('@financial-times/n-es-client');

describe('related-content signal', () => {
	let subject;
	let stubs;
	const defaultResults = {
		esSearch: [{id: 1}],
		concepts: [{
			predicate: 'http://www.ft.com/ontology/annotation/about',
			id: 0
		}, {
			predicate: 'http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy',
			id: 1
		}]
	}
	let results;

	beforeEach(() => {
		results = Object.assign({}, defaultResults);
		sinon.stub(es, 'search').callsFake(() => Promise.resolve(results.esSearch));
		stubs = {
			getMostRelatedConcepts: sinon.stub().callsFake(() => results.concepts)
		};
		subject = proxyquire('../../server/signals/related-content', {
			'../lib/get-most-related-concepts': stubs.getMostRelatedConcepts
		});
	});

	afterEach(() => es.search.restore())

	context('onward slot', () => {

		it('use get-most-related-concepts to pick concepts', () => {
			return subject({
				id: 'parent-id',
				curatedRelatedContent: []
			}, {slots: {onward: true}})
				.then(result => {
					expect(stubs.getMostRelatedConcepts).calledWith({
						id: 'parent-id',
						curatedRelatedContent: []
					});
				})
		});

		it('return empty object if no concepts available', () => {
			results.concepts = undefined;
			return subject({
				id: 'parent-id',
				curatedRelatedContent: []
			}, {slots: {onward: true}})
				.then(result => {
					expect(result).to.eql({});
				})
		});

		it('avoid recommending the current article!', () => {
			return subject({
				id: 'parent-id',
				curatedRelatedContent: [],
				annotations: [{
					predicate: 'http://www.ft.com/ontology/annotation/about',
					id: 0
				}]
			}, {slots: {onward: true}})
				.then(() => {
					expect(es.search.args[0][0].query.bool.must_not[0].term.id).to.equal('parent-id');
				})
		});

		it('maximum of 3 teasers per concept', () => {
			let calls = 0;
			es.search.restore(); // remove the default stub
			sinon.stub(es, 'search').callsFake(() => {
				return Promise.resolve(
					[...Array(6)]
						.map((v, i) => ({id: i + (6 * calls)}))
				)
			});
			return subject({
				id: 'parent-id',
				curatedRelatedContent: [],
				annotations: [{
					predicate: 'http://www.ft.com/ontology/annotation/about',
					id: 0
				},{
					predicate: 'http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy',
					id: 1
				}]
			}, {slots: {onward: true}})
				.then(result => {
					expect(result.onward[0].recommendations.length).to.equal(3);
					expect(result.onward[1].recommendations.length).to.equal(3);
				})
		});

		it('dedupe teasers in second onward section', () => {
			let calls = 0;
			es.search.restore(); // remove the default stub
			sinon.stub(es, 'search').callsFake(() => {
				return Promise.resolve(
					[...Array(6)]
						.map((v, i) => ({id: i + (1 * calls)}))
				)
			});
			return subject({
				id: 'parent-id',
				curatedRelatedContent: [],
				annotations: [{
					predicate: 'http://www.ft.com/ontology/annotation/about',
					id: 0
				},{
					predicate: 'http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy',
					id: 1
				}]
			}, {slots: {onward: true}})
				.then(({onward: [onward1, onward2]}) => {
					expect(onward1.recommendations).to.eql([ { id: 0 }, { id: 1 }, { id: 2 } ]);
					expect(onward2.recommendations).to.eql([ { id: 3 }, { id: 4 }, { id: 5 } ]);
				})
		});

		it('don\'t show if no teasers', () => {
			results.esSearch = [];
			return subject({
				id: 'parent-id',
				curatedRelatedContent: [],
				annotations: [{
					predicate: 'http://www.ft.com/ontology/annotation/about',
					id: 0
				},{
					predicate: 'http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy',
					id: 1
				}]
			}, {slots: {onward: true}})
				.then(result => {
					expect(result).to.eql({});
				})
		});
	});

	context('rhr slot', () => {

		it('use get-most-related-concepts to pick concepts', () => {
			return subject({
				id: 'parent-id',
				curatedRelatedContent: []
			}, {slots: {onward: true}})
				.then(result => {
					expect(stubs.getMostRelatedConcepts).calledWith({
						id: 'parent-id',
						curatedRelatedContent: []
					});
				})
		});

		it('prefer curated related content and dedupe', () => {
			results.esSearch = [ { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 } ];
			sinon.stub(es, 'mget').returns([{id: 3}, {id: 6}]);
			return subject({
				id: 'parent-id',
				curatedRelatedContent: [{id: '3'}, {id: '6'}],
				annotations: [{
					predicate: 'http://www.ft.com/ontology/annotation/about',
					id: 0
				}]
			}, {slots: {rhr: true}})
				.then(result => {
					expect(result.rhr.recommendations).to.eql([ { id: 3 }, { id: 6 }, { id: 1 }, { id: 2 }, { id: 4 } ]);
					es.mget.restore();
				})
		});

		it('handle case where no curatedRelatedContent', () => {
			results.esSearch = [ { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 } ];
			return subject({
				id: 'parent-id',
				curatedRelatedContent: [],
				annotations: [{
					predicate: 'http://www.ft.com/ontology/annotation/about',
					id: 0
				}]
			}, {slots: {rhr: true}})
				.then(result => {
					expect(result.rhr.recommendations).to.eql([ { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 } ]);
				})
		});
	});
});
