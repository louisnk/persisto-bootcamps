const env = process.env;

module.exports = Object.freeze({
	aws: {
		bucket: env.AWS_DEFAULT_BUCKET || 'persisto-labs-leads',
		credentials: {
			accessKeyId: env.AWS_ACCESS_KEY_ID,
			secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
		},
		region: env.AWS_DEFAULT_REGION || 'us-east-1'
	},
	emails: {
		louis: 'louis@persistolabs.com',
		misha: 'mikhael@persistolabs.com',
		support: 'support@persistolabs.com'
	},
	postmark: {
		key: env.POSTMARK_KEY
	}
});