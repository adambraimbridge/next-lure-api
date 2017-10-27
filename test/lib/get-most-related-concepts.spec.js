const {expect} = require('chai');
const subject = require('../../server/lib/get-most-related-concepts');

describe('get most related concepts', () => {
	it('use about and isPrimarilyClassifiedBy by default', () => {
		const result = subject({
			annotations: [{
				predicate: 'http://www.ft.com/ontology/annotation/about',
				id: 0
			}, {
				predicate: 'http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy',
				id: 1
			}]
		});
		expect(result[0].id).to.equal(0);
		expect(result[1].id).to.equal(1);
	});

	it('fallback to brand if either preferred annotation is missing', () => {
		const result = subject({
			annotations: [{
				predicate: 'http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy',
				id: 1
			}],
			brandConcept: {
				id: 2,
				predicate: 'whatevs'
			}
		});
		expect(result[0].id).to.equal(1);
		expect(result[1].id).to.equal(2);
	});

	it('handle case where only one preferred annotation is present', () => {
		const result = subject({
			annotations: [{
				predicate: 'http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy',
				id: 1
			}]
		});
		expect(result[0].id).to.equal(1);
		expect(result.length).to.equal(1);
	});

	it('handle case where no preferred annotations are present', () => {
		const result = subject({
			annotations: []
		});
		expect(result).to.be.undefined;
	});

	it('handle case where no about, and isPrimarilyClassifiedBy by the brand', () => {
		const result = subject({
			annotations: [{
				predicate: 'http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy',
				id: 1
			}],
			brandConcept: {
				predicate: 'http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy',
				id: 1
			}
		});
		expect(result[0].id).to.equal(1);
		expect(result.length).to.equal(1);
	});

	it('handle case where content has no annotations', () => {
		const result = subject({});
		expect(result).to.be.undefined;
	})
});
