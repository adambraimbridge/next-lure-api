// TODO add edition as an argument like below, I couldn't do that before acutually using the edition because it causes a eslint error... X-(
// module.exports = async (content, {edition, localTimeHour, slots}) => {
module.exports = async (content, {localTimeHour, slots}) => {

	const ampm = parseFloat(localTimeHour) > 12 ? 'pm' : 'am';
	const response = {};

	switch (ampm) {
		case 'am':
			// TODO set correct properties
			// const amRecommendationsModel = {
			// 	title: 'Morning Recommendations',
			// 	titleHref: '/',
			// 	tracking: 'morning-recommendations'
			// };

			if (slots.rhr) {
			}

			if (slots.onward) {
			}
			break;

		case 'pm':
			// TODO set correct properties
			// const pmRecommendationsModel = {
			// 	title: 'Evening Recommendations',
			// 	titleHref: '/',
			// 	tracking: 'evening-recommendations'
			// };

			if (slots.rhr) {
			}

			if (slots.onward) {
			}
			break;
		default:
	}

	return response;

};
