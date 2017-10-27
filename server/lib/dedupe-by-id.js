module.exports = (subjects, filters) => {
	if (filters) {
		return subjects.filter(subject => !filters.find(filter => subject.id === filter.id))
	} else {
		return subjects.reduce((result, subject) => {
			if (!result.find(filter => subject.id === filter.id)) {
				result.push(subject);
			}
			return result
		}, [])
	}
};
