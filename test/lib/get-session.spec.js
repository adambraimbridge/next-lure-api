const { expect } = require('chai');
const fetchMock = require('fetch-mock');

const subject = require('../../server/lib/get-session');

describe('get session', () => {
	afterEach(() => fetchMock.restore());

	it('should throw an error if token is not provided', () => {
		expect(subject).to.throw(Error, 'Missing session token');
	});

	it('should return a session object if the session is found', () => {
		const validSessionToken = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
		const userId = '00000000-0000-0000-0000-000000000000';
		fetchMock.get('*', { uuid: userId });
		return subject(validSessionToken)
			.then(result => expect(result).to.deep.equal({ uuid: userId }))
			.then(() => expect(fetchMock.lastUrl()).to.equal(`https://api.ft.com/sessions/s/${validSessionToken}`));
	});

	it('should throw an error if the call to the session service fails', () => {
		const validSessionToken = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
		fetchMock.get('*', 500);
		return subject(validSessionToken)
			.catch(reason => expect(reason.message).to.equal('Internal Server Error'));
	});

	it('should throw an error if the session is not found', () => {
		const invalidSessionToken = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
		fetchMock.get('*', 404);
		return subject(invalidSessionToken)
			.catch(reason => expect(reason.message).to.equal('Not Found'));
	});
});
