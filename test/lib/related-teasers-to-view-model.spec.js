
			// it('output heading & href for concepts', () => {
			// 	sinon.stub(es, 'search').returns(Promise.resolve([{id: 1}]));
			// 	return subject({
			// 		id: 'parent-id',
			// 		curatedRelatedContent: [],
			// 		annotations: [{
			// 			predicate: 'http://www.ft.com/ontology/annotation/about',
			// 			prefLabel: 'aboot',
			// 			preposition: 'on',
			// 			relativeUrl: '/aboot',
			// 			id: 0
			// 		},{
			// 			predicate: 'http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy',
			// 			prefLabel: 'primarily',
			// 			preposition: 'in',
			// 			relativeUrl: '/primarily',
			// 			id: 1
			// 		}]
			// 	}, {slots: {onward: true}})
			// 		.then(({onward: [onward1, onward2]}) => {
			// 			expect(onward1.title).to.equal('Latest on aboot');
			// 			expect(onward2.title).to.equal('Latest in primarily');
			// 			expect(onward1.titleHref).to.equal('/aboot');
			// 			expect(onward2.titleHref).to.equal('/primarily');
			// 			es.search.restore();
			// 		})
			// })

			// describe('tracking', () => {
			// 	before(() => sinon.stub(es, 'search').returns(Promise.resolve([{id: 1}])))
			// 	after(() => es.search.restore());

			// 	it('output correct tracking for about', () => {
			// 		return subject({
			// 			id: 'parent-id',
			// 			curatedRelatedContent: [],
			// 			annotations: [{
			// 				predicate: 'http://www.ft.com/ontology/annotation/about',
			// 				id: 0
			// 			}]
			// 		}, {slots: {onward: true}})
			// 			.then(({onward: [onward1]}) => {
			// 				expect(onward1.tracking).to.equal('about')
			// 			});

			// 	});

			// 	it('output correct tracking for isPrimarilyClassifiedBy', () => {
			// 		return subject({
			// 			id: 'parent-id',
			// 			curatedRelatedContent: [],
			// 			annotations: [{
			// 				predicate: 'http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy',
			// 				id: 1
			// 			}]
			// 		}, {slots: {onward: true}})
			// 			.then(({onward: [onward1]}) => {
			// 				expect(onward1.tracking).to.equal('isPrimarilyClassifiedBy')
			// 			});
			// 	});

			// 	it('output correct tracking for brand', () => {
			// 		return subject({
			// 			id: 'parent-id',
			// 			curatedRelatedContent: [],
			// 			annotations: [],
			// 			brandConcept: {
			// 				predicate: 'whatevs',
			// 				id: 1
			// 			}
			// 		}, {slots: {onward: true}})
			// 			.then(({onward: [onward1]}) => {
			// 				expect(onward1.tracking).to.equal('brand')
			// 			});
			// 	});

			// })
