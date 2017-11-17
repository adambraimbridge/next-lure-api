const { expect } = require('chai');
const es = require('@financial-times/n-es-client');
const subject = require('../../server/lib/get-related-content');
const sinon = require('sinon');

describe('get related content', () => {
	beforeEach(() => {
		sinon.stub(es, 'search').returns(Promise.resolve([{id: 'parent-id'}, {id: 'not-parent-id'}]));
	});
	afterEach(() => {
		es.search.restore();
	})
	it('request count + 1 articles', async () => {
		await subject({id: 'concept-id'}, 3, 'parent-id');
		expect(es.search.args[0][0].size).to.equal(4);
	});

	it('remove parent article id', async () => {
		const result = await subject({id: 'concept-id'}, 3, 'parent-id');
		expect(result.teasers).to.eql([{id: 'not-parent-id'}]	);
	});

	it('by default include all genres', async () => {
		await subject({id: 'concept-id'}, 3, 'parent-id');
		expect(es.search.args[0][0].query).to.eql({ term: { 'annotations.id': 'concept-id' } });
	});

	it('can exclude news', async () => {
		await subject({id: 'concept-id'}, 3, 'parent-id', false);
		expect(es.search.args[0][0].query).to.eql({
			'boolean': {
				'must': [
					{
						'term': {
							'annotations.id': 'concept-id'
						}
					}
				],
				'must_not': [
					{
						'term': {
							'genreConcept.id': '9b40e89c-e87b-3d4f-b72c-2cf7511d2146'
						}
					}
				]
			}
		});
	});

	it('can exclude non news', async () => {
		await subject({id: 'concept-id'}, 3, 'parent-id', true);
		expect(es.search.args[0][0].query).to.eql({
			'boolean': {
				'must': [
					{
						'term': {
							'annotations.id': 'concept-id'
						}
					},
					{
						'term': {
							'genreConcept.id': '9b40e89c-e87b-3d4f-b72c-2cf7511d2146'
						}
					}
				]
			}
		});
	});

});