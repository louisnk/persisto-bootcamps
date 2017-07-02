const env = process.env;

module.exports = Object.freeze({
	aws: {
		bucket: env.AWS_DEFAULT_BUCKET || 'persisto-mentors',
		credentials: {
			accessKeyId: env.AWS_ACCESS_KEY_ID,
			secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
		},
		region: env.AWS_DEFAULT_REGION || 'us-east-1'
	},
	emails: {
		louis: 'louis@persisto.systems',
		misha: 'director@mikhaelbd.com',
		support: 'support@persisto.systems'
	},
	postmark: {
		key: env.POSTMARK_KEY
	}
});