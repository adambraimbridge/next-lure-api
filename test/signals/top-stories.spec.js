// const {expect} = require('chai');
// const subject = require('../../server/signals/top-stories');
// const poller = require('../../server/data-sources/top-stories-poller');
// const fetchMock = require('fetch-mock');
// const sinon = require('sinon');
// const es = require('@financial-times/n-es-client');

// describe('top-stories signal', () => {
// 	context('onward slot', () => {
// 		describe('choice of concepts', () => {

// 			before(() => {
// 				sinon.stub(es, 'search').returns(Promise.resolve([{id: 1}]));
// 			})

// 			after(() => es.search.restore());

// 			it('use about and isPrimarilyClassifiedBy by default', () => {
// 				return subject({
// 					id: 'parent-id',
// 					curatedRelatedContent: [],
// 					annotations: [{
// 						predicate: 'http://www.ft.com/ontology/annotation/about',
// 						id: 0
// 					}, {
// 						predicate: 'http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy',
// 						id: 1
// 					}]
// 				}, {slots: {onward: true}})
// 					.then(result => {
// 						expect(result.onward[0].concept.id).to.equal(0);
// 						expect(result.onward[1].concept.id).to.equal(1);
// 					})
// 			});

// 			it('fallback to brand if either preferred annotation is missing', () => {
// 				return subject({
// 					id: 'parent-id',
// 					curatedRelatedContent: [],
// 					annotations: [{
// 						predicate: 'http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy',
// 						id: 1
// 					}],
// 					brandConcept: {
// 						id: 2,
// 						predicate: 'whatevs'
// 					}
// 				}, {slots: {onward: true}})
// 					.then(result => {
// 						expect(result.onward[0].concept.id).to.equal(1);
// 						expect(result.onward[1].concept.id).to.equal(2);
// 					})
// 			});

// 			it('handle case where only one preferred annotation is present', () => {
// 				return subject({
// 					id: 'parent-id',
// 					curatedRelatedContent: [],
// 					annotations: [{
// 						predicate: 'http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy',
// 						id: 1
// 					}]
// 				}, {slots: {onward: true}})
// 					.then(result => {
// 						expect(result.onward[0].concept.id).to.equal(1);
// 						expect(result.onward.length).to.equal(1);
// 					})
// 			});

// 			it('handle case where no preferred annotations are present', () => {
// 				return subject({
// 					id: 'parent-id',
// 					curatedRelatedContent: [],
// 					annotations: []
// 				}, {slots: {onward: true}})
// 					.then(result => {
// 						expect(result.onward).to.be.undefined;
// 					})
// 			});

// 			it('handle case where no about, and isPrimarilyClassifiedBy by the brand', () => {
// 				return subject({
// 					id: 'parent-id',
// 					curatedRelatedContent: [],
// 					annotations: [{
// 						predicate: 'http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy',
// 						id: 1
// 					}],
// 					brandConcept: {
// 						predicate: 'http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy',
// 						id: 1
// 					}
// 				}, {slots: {onward: true}})
// 					.then(result => {
// 						expect(result.onward[0].concept.id).to.equal(1);
// 						expect(result.onward.length).to.equal(1);
// 					})
// 			});
// 		});

// 		describe('content', () => {
// 			it('avoid recommending the current article!', () => {
// 				sinon.stub(es, 'search').returns(Promise.resolve([{id: 1}]));
// 				return subject({
// 					id: 'parent-id',
// 					curatedRelatedContent: [],
// 					annotations: [{
// 						predicate: 'http://www.ft.com/ontology/annotation/about',
// 						id: 0
// 					}]
// 				}, {slots: {onward: true}})
// 					.then(() => {
// 						expect(es.search.args[0][0].query.bool.must_not[0].term.id).to.equal('parent-id');
// 						es.search.restore();
// 					})
// 			});

// 			it('maximum of 3 teasers per concept', () => {
// 				let calls = 0;
// 				sinon.stub(es, 'search').callsFake(() => {
// 					return Promise.resolve(
// 						[...Array(6)]
// 							.map((v, i) => ({id: i + (6 * calls)}))
// 					)
// 				});
// 				return subject({
// 					id: 'parent-id',
// 					curatedRelatedContent: [],
// 					annotations: [{
// 						predicate: 'http://www.ft.com/ontology/annotation/about',
// 						id: 0
// 					},{
// 						predicate: 'http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy',
// 						id: 1
// 					}]
// 				}, {slots: {onward: true}})
// 					.then(result => {
// 						expect(result.onward[0].recommendations.length).to.equal(3);
// 						expect(result.onward[1].recommendations.length).to.equal(3);
// 						es.search.restore();
// 					})
// 			});

// 			it('dedupe teasers in second onward section', () => {
// 				let calls = 0;
// 				sinon.stub(es, 'search').callsFake(() => {
// 					return Promise.resolve(
// 						[...Array(6)]
// 							.map((v, i) => ({id: i + (1 * calls)}))
// 					)
// 				});
// 				return subject({
// 					id: 'parent-id',
// 					curatedRelatedContent: [],
// 					annotations: [{
// 						predicate: 'http://www.ft.com/ontology/annotation/about',
// 						id: 0
// 					},{
// 						predicate: 'http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy',
// 						id: 1
// 					}]
// 				}, {slots: {onward: true}})
// 					.then(({onward: [onward1, onward2]}) => {
// 						expect(onward1.recommendations).to.eql([ { id: 0 }, { id: 1 }, { id: 2 } ]);
// 						expect(onward2.recommendations).to.eql([ { id: 3 }, { id: 4 }, { id: 5 } ]);
// 						es.search.restore();
// 					})
// 			});

// 			it('don\'t show if no teasers', () => {
// 				sinon.stub(es, 'search').returns(Promise.resolve([]));
// 				return subject({
// 					id: 'parent-id',
// 					curatedRelatedContent: [],
// 					annotations: [{
// 						predicate: 'http://www.ft.com/ontology/annotation/about',
// 						id: 0
// 					},{
// 						predicate: 'http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy',
// 						id: 1
// 					}]
// 				}, {slots: {onward: true}})
// 					.then(result => {
// 						expect(result).to.eql({});
// 						es.search.restore();
// 					})
// 			});

// 			it('output heading & href for concepts', () => {
// 				sinon.stub(es, 'search').returns(Promise.resolve([{id: 1}]));
// 				return subject({
// 					id: 'parent-id',
// 					curatedRelatedContent: [],
// 					annotations: [{
// 						predicate: 'http://www.ft.com/ontology/annotation/about',
// 						prefLabel: 'aboot',
// 						preposition: 'on',
// 						relativeUrl: '/aboot',
// 						id: 0
// 					},{
// 						predicate: 'http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy',
// 						prefLabel: 'primarily',
// 						preposition: 'in',
// 						relativeUrl: '/primarily',
// 						id: 1
// 					}]
// 				}, {slots: {onward: true}})
// 					.then(({onward: [onward1, onward2]}) => {
// 						expect(onward1.title).to.equal('Latest on aboot');
// 						expect(onward2.title).to.equal('Latest in primarily');
// 						expect(onward1.titleHref).to.equal('/aboot');
// 						expect(onward2.titleHref).to.equal('/primarily');
// 						es.search.restore();
// 					})
// 			})

// 			describe('tracking', () => {
// 				before(() => sinon.stub(es, 'search').returns(Promise.resolve([{id: 1}])))
// 				after(() => es.search.restore());

// 				it('output correct tracking for about', () => {
// 					return subject({
// 						id: 'parent-id',
// 						curatedRelatedContent: [],
// 						annotations: [{
// 							predicate: 'http://www.ft.com/ontology/annotation/about',
// 							id: 0
// 						}]
// 					}, {slots: {onward: true}})
// 						.then(({onward: [onward1]}) => {
// 							expect(onward1.tracking).to.equal('about')
// 						});

// 				});

// 				it('output correct tracking for isPrimarilyClassifiedBy', () => {
// 					return subject({
// 						id: 'parent-id',
// 						curatedRelatedContent: [],
// 						annotations: [{
// 							predicate: 'http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy',
// 							id: 1
// 						}]
// 					}, {slots: {onward: true}})
// 						.then(({onward: [onward1]}) => {
// 							expect(onward1.tracking).to.equal('isPrimarilyClassifiedBy')
// 						});
// 				});

// 				it('output correct tracking for brand', () => {
// 					return subject({
// 						id: 'parent-id',
// 						curatedRelatedContent: [],
// 						annotations: [],
// 						brandConcept: {
// 							predicate: 'whatevs',
// 							id: 1
// 						}
// 					}, {slots: {onward: true}})
// 						.then(({onward: [onward1]}) => {
// 							expect(onward1.tracking).to.equal('brand')
// 						});
// 				});

// 			})

// 		});
// 	});

// 	context('rhr slot', () => {
// 		before(() => sinon.stub(es, 'search').returns(Promise.resolve([{id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}])))
// 		after(() => es.search.restore());

// 		it('use about by default', () => {
// 			return subject({
// 				id: 'parent-id',
// 				curatedRelatedContent: [],
// 				annotations: [{
// 					predicate: 'http://www.ft.com/ontology/annotation/about',
// 					id: 0
// 				}, {
// 					predicate: 'http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy',
// 					id: 1
// 				}]
// 			}, {slots: {rhr: true}})
// 				.then(result => {
// 					expect(result.rhr.concept.id).to.equal(0);
// 				})
// 		});

// 		it('fallback to isPrimarilyClassifiedBy ', () => {
// 			return subject({
// 				id: 'parent-id',
// 				curatedRelatedContent: [],
// 				annotations: [{
// 					predicate: 'http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy',
// 					id: 1
// 				}]
// 			}, {slots: {rhr: true}})
// 				.then(result => {
// 					expect(result.rhr.concept.id).to.equal(1);
// 				})
// 		});

// 		it('fallback to brand ', () => {
// 			return subject({
// 				id: 'parent-id',
// 				curatedRelatedContent: [],
// 				annotations: [],
// 				brandConcept: {
// 					id: 2,
// 					predicate: 'whatevs'
// 				}
// 			}, {slots: {rhr: true}})
// 				.then(result => {
// 					expect(result.rhr.concept.id).to.equal(2);
// 				})
// 		});

// 		it('prefer curated related content and dedupe', () => {
// 			sinon.stub(es, 'mget').returns([{id: 3}, {id: 6}])
// 			return subject({
// 				id: 'parent-id',
// 				curatedRelatedContent: [{id: '3'}, {id: '6'}],
// 				annotations: [{
// 					predicate: 'http://www.ft.com/ontology/annotation/about',
// 					id: 0
// 				}]
// 			}, {slots: {rhr: true}})
// 				.then(result => {
// 					expect(result.rhr.recommendations).to.eql([ { id: 3 }, { id: 6 }, { id: 1 }, { id: 2 }, { id: 4 } ]);
// 					es.mget.restore();
// 				})
// 		});

// 		it('handle case where no curatedRelatedContent', () => {
// 			return subject({
// 				id: 'parent-id',
// 				curatedRelatedContent: [],
// 				annotations: [{
// 					predicate: 'http://www.ft.com/ontology/annotation/about',
// 					id: 0
// 				}]
// 			}, {slots: {rhr: true}})
// 				.then(result => {
// 					expect(result.rhr.recommendations).to.eql([ { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 } ]);
// 				})
// 		});
// 	});
// });
