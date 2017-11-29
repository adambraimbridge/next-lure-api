// const {expect} = require('chai');
// const subject = require('../../server/lib/related-teasers-to-view-model');

// describe('related teasers to view model', () => {
// 	it('expose concept and recommendations concept', () => {
// 		const concept = {
// 			predicate: 'http://www.ft.com/ontology/annotation/about',
// 			prefLabel: 'aboot',
// 			preposition: 'on',
// 			relativeUrl: '/aboot',
// 			id: 0
// 		};
// 		const result = subject({
// 			concept,
// 			teasers: [{id: 1}]
// 		});
// 		expect(result.title).to.equal('Latest on aboot');
// 		expect(result.titleHref).to.equal('/aboot');
// 		expect(result.concept).to.eql(concept);
// 		expect(result.tracking).to.exist;
// 		expect(result.recommendations).to.eql([{id: 1}]);
// 	});

// 	describe('tracking', () => {

// 		it('output correct tracking for about', () => {
// 			const result = subject({
// 				concept: {
// 					predicate: 'http://www.ft.com/ontology/annotation/about',
// 					id: 0
// 				},
// 				teasers: [{id: 1}]
// 			});
// 			expect(result.tracking).to.equal('about');
// 		});

// 		it('output correct tracking for isPrimarilyClassifiedBy', () => {
// 			const result = subject({
// 				concept: {
// 					predicate: 'http://www.ft.com/ontology/annotation/isPrimarilyClassifiedBy',
// 					id: 0
// 				},
// 				teasers: [{id: 1}]
// 			});
// 			expect(result.tracking).to.equal('isPrimarilyClassifiedBy');
// 		});

// 		it('output correct tracking for brand', () => {
// 			const result = subject({
// 				concept: {
// 					predicate: 'whatevs',
// 					id: 0
// 				},
// 				teasers: [{id: 1}]
// 			});
// 			expect(result.tracking).to.equal('brand');
// 		});

// 	});
// });


	// // hard to test, and not 100% it's the behaviour we want anyway
	// it.only('respond with 404 if no recommendations found', async () => {
	// 	const mocks = getMockArgs(sandbox);
	// 	signalStubs = {
	// 		relatedContent: sandbox.stub().callsFake(async () => undefined)
	// 	};
	// 	middleware = proxyquire('../../server/middleware/get-recommendations', {
	// 		'../signals': signalStubs
	// 	});
	// 	await middleware(...mocks);
	// 	console.log(mocks[1].status)
	// 	expect(mocks[1].status).calledWith(404);
	// });


// it.only('dedupe teasers in second onward section', () => {
// 			let calls = 0;
// 			es.search.restore(); // remove the default stub
// 			sinon.stub(es, 'search').callsFake(() => {
// 				return Promise.resolve(
// 					[...Array(6)]
// 						.map((v, i) => ({id: i + (1 * calls)}))
// 				);
// 			});
// 			return subject({
// 				id: 'parent-id',
// 				curatedRelatedContent: [],
// 				annotations: [{
// 					predicate: 'http://www.ft.com/ontology/annotation/about',
// 					id: 0
// 				},{
// 					predicate: 'http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy',
// 					id: 1
// 				}]
// 			}, {locals: {slots: {onward: true, rhr: true}}})
// 				.then(({onward: [onward1, onward2]}) => {
// 					expect(onward1.items).to.eql([ { id: 0 }, { id: 1 }, { id: 2 } ]);
// 					expect(onward2.items).to.eql([ { id: 3 }, { id: 4 }, { id: 5 } ]);
// 				});
// 		});
