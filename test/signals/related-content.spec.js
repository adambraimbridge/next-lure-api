const {expect} = require('chai');
const subject = require('../../server/signals/related-content');
const fetchMock = require('fetch-mock');
const sinon = require('sinon');
const es = require('@financial-times/n-es-client');

describe('related-content signal', () => {
	context('onward slot', () => {
		describe('choice of concepts', () => {

			before(() => {
				sinon.stub(es, 'search').returns(Promise.resolve([{id: 1}]));
			})

			after(() => es.search.restore());

			it('use about and isPrimarilyClassifiedBy by default', () => {
				return subject({
					id: 'parent-id',
					curatedRelatedContent: [],
					annotations: [{
						predicate: 'http://www.ft.com/ontology/annotation/about',
						id: 0
					}, {
						predicate: 'http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy',
						id: 1
					}]
				}, {slots: {onward: true}})
					.then(result => {
						expect(result.onward[0].concept.id).to.equal(0);
						expect(result.onward[1].concept.id).to.equal(1);
					})
			});

			it('fallback to brand if either preferred annotation is missing', () => {
				return subject({
					id: 'parent-id',
					curatedRelatedContent: [],
					annotations: [{
						predicate: 'http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy',
						id: 1
					}],
					brandConcept: {
						id: 2,
						predicate: 'whatevs'
					}
				}, {slots: {onward: true}})
					.then(result => {
						expect(result.onward[0].concept.id).to.equal(1);
						expect(result.onward[1].concept.id).to.equal(2);
					})
			});

			it('handle case where only one preferred annotation is present', () => {
				return subject({
					id: 'parent-id',
					curatedRelatedContent: [],
					annotations: [{
						predicate: 'http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy',
						id: 1
					}]
				}, {slots: {onward: true}})
					.then(result => {
						expect(result.onward[0].concept.id).to.equal(1);
						expect(result.onward.length).to.equal(1);
					})
			});

			it('handle case where no preferred annotations are present', () => {
				return subject({
					id: 'parent-id',
					curatedRelatedContent: [],
					annotations: []
				}, {slots: {onward: true}})
					.then(result => {
						expect(result.onward).to.be.undefined;
					})
			});

			it('handle case where no about, and isPrimarilyClassifiedBy by the brand', () => {
				return subject({
					id: 'parent-id',
					curatedRelatedContent: [],
					annotations: [{
						predicate: 'http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy',
						id: 1
					}],
					brandConcept: {
						predicate: 'http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy',
						id: 1
					}
				}, {slots: {onward: true}})
					.then(result => {
						expect(result.onward[0].concept.id).to.equal(1);
						expect(result.onward.length).to.equal(1);
					})
			});
		});

		describe('content', () => {
			it('avoid recommending the current article!', () => {

			});

			it('maximum of 3 teasers per concept', () => {

			});

			it('dedupe teasers in second onward section', () => {

			});

			// don't show if no teasers

			it('output heading href for concepts', () => {

			})

			describe('tracking', () => {
				it('output correct tracking for about', () => {

				});

				it('output correct tracking for isPrimarilyClassifiedBy', () => {

				});

				it('output correct tracking for brand', () => {

				});

			})

		});
	});

	context('rhr slot', () => {
		it('use about by default', () => {

		});

		it('fallback to isPrimarilyClassifiedBy ', () => {

		});

		it('fallback to brand ', () => {

		});

		it('prefer curated related content and dedupe', () => {

		});

		it('handle case where no curatedRelatedContent', () => {

		});

	});
});
