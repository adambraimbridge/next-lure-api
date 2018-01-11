const logger = require('@financial-times/n-logger').default;

module.exports = secureSessionToken => {
	if (!secureSessionToken) {
		return Promise.reject(401);
	}
	const options = { 'headers': { 'X-Api-Key': process.env.SESSION_SERVICE_API_KEY }};
	return fetch(`https://api.ft.com/sessions/s/${secureSessionToken}`, options)
		.then(result => {
			if (result.ok) {
				return result.json();
			} else {
				return Promise.reject(new Error(result.statusText));
			}
		})
		.catch(err => {
			logger.warn(err);
		});
};
