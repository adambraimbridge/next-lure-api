const { expect } = require('chai');
const sinon = require('sinon');

const transformMyFTData = require('../../server/lib/transform-myft-data.js');
const subject = transformMyFTData.removeOldArticles;

const ONE_HOUR = 60 * 60 * 1000;

describe('transformMyFTData', () => {
	describe('removeOldArticles()', () => {
		it('should return FALSE if an article does not have a `firstPublishedDate` field', () => {
			const article = {};
			expect(subject(article)).to.be.false;
		});

		it('should return FALSE if an article has an invalid `firstPublishedDate` field', () => {
			const article = { firstPublishedDate: 'invalid date' };
			expect(subject(article)).to.be.false;
		});

		it('should return TRUE if an article was published less than 48 hours ago', () => {
			const fakeNow = new Date('2018-01-15');
			const recentArticles = [
				{ firstPublishedDate: (new Date(fakeNow.getTime())) },
				{ firstPublishedDate: (new Date(fakeNow.getTime() - 1 * ONE_HOUR)) },
				{ firstPublishedDate: (new Date(fakeNow.getTime() - 10 * ONE_HOUR)) },
				{ firstPublishedDate: (new Date(fakeNow.getTime() - 47 * ONE_HOUR)) },
			];
			const clock = sinon.useFakeTimers(fakeNow.getTime());
			recentArticles.forEach(article => expect(subject(article)).to.be.true);
			clock.restore();
		});

		it('should return FALSE if an article was published more than 48 hours ago', () => {
			const fakeNow = new Date('2018-01-15');
			const oldArticles = [
				{ firstPublishedDate: (new Date(fakeNow.getTime() - 49 * ONE_HOUR)) },
				{ firstPublishedDate: (new Date(fakeNow.getTime() - 100 * ONE_HOUR)) },
				{ firstPublishedDate: (new Date(fakeNow.getTime() - 200 * ONE_HOUR)) },
			];
			const clock = sinon.useFakeTimers(fakeNow.getTime());
			oldArticles.forEach(article => expect(subject(article)).to.be.false);
			clock.restore();
		});
	});
});
