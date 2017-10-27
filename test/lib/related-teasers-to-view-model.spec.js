const {expect} = require('chai');
const subject = require('../../server/lib/related-teasers-to-view-model');

describe('related teasers to view model', () => {
	it('expose concept and recommendations concept', () => {
		const concept = {
			predicate: 'http://www.ft.com/ontology/annotation/about',
			prefLabel: 'aboot',
			preposition: 'on',
			relativeUrl: '/aboot',
			id: 0
		};
		const result = subject({
			concept,
			teasers: [{id: 1}]
		});
		expect(result.title).to.equal('Latest on aboot');
		expect(result.titleHref).to.equal('/aboot');
		expect(result.concept).to.eql(concept);
		expect(result.tracking).to.exist;
		expect(result.recommendations).to.eql([{id: 1}]);
	});

	describe('tracking', () => {

		it('output correct tracking for about', () => {
			const result = subject({
				concept: {
					predicate: 'http://www.ft.com/ontology/annotation/about',
					id: 0
				},
				teasers: [{id: 1}]
			});
			expect(result.tracking).to.equal('about');
		});

		it('output correct tracking for isPrimarilyClassifiedBy', () => {
			const result = subject({
				concept: {
					predicate: 'http://www.ft.com/ontology/annotation/isPrimarilyClassifiedBy',
					id: 0
				},
				teasers: [{id: 1}]
			});
			expect(result.tracking).to.equal('isPrimarilyClassifiedBy');
		});

		it('output correct tracking for brand', () => {
			const result = subject({
				concept: {
					predicate: 'whatevs',
					id: 0
				},
				teasers: [{id: 1}]
			});
			expect(result.tracking).to.equal('brand');
		});

	});
});
