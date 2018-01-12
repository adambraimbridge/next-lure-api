const { expect } = require('chai');
const sinon = require('sinon');

const subject = require('../../server/middleware/respond');

describe('respond middleware', () => {
	it('will not cache the response if requested to do so', () => {
		const FT_NO_CACHE = {};
		const res = {
			locals: {
				recommendations: {
					_noCache: true,
				}
			},
			set: sinon.spy(),
			json: () => {},
			FT_NO_CACHE,
		};
		subject({}, res);
		expect(res.set.calledOnce).to.be.true;
		expect(res.set.calledWith('Surrogate-Control', FT_NO_CACHE)).to.be.true;
	});
});
