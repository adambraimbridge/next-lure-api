// TODO add edition as an argument like below, I couldn't do that before acutually using the edition because it causes a eslint error... X-(
// module.exports = async (content, {edition, localTimeHour, slots}) => {
module.exports = async (content, {localTimeHour}) => {

	const response = {};

	if (localTimeHour > 5 && localTimeHour < 11) {
		// am
		return response;
	}

	if (localTimeHour > 14 && localTimeHour < 20) {
		// pm
		return response;
	}

	// otherwise return undefined to fall through to next thing in the stack




};
