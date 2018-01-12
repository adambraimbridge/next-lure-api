const logger = require('@financial-times/n-logger').default;

module.exports = secureSessionToken => {
	if (!secureSessionToken) {
		logger.warn({ event: 'MISSING_SESSION_TOKEN' });
		throw new Error('Missing session token');
	}
	const options = { 'headers': { 'X-Api-Key': process.env.SESSION_SERVICE_API_KEY }};
	return fetch(`https://api.ft.com/sessions/s/${secureSessionToken}`, options)
		.then(result => {
			if (result.ok) {
				return result.json();
			} else {
				throw new Error(result.statusText);
			}
		})
		.catch(err => {
			logger.warn(err);
			throw err;
		});
};
