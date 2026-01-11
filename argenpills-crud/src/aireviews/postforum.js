const { SSMClient, GetParameterCommand } = require("@aws-sdk/client-ssm");

async function getParameter(paramName, ssmClient) {
	const command = new GetParameterCommand({
		Name: paramName,
		WithDecryption: true
	});

	const response = await ssmClient.send(command);
	return response.Parameter.Value;
}

exports.Testeablehandler = async (event, context, SSMClient) => {
	let API_URL, API_TOKEN;

	let photoId;
	if (event.body) {
		try {
			const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
			photoId = body.photoId;
		} catch (e) {
			console.log("Error parsing body", e);
		}
	}

	if (!photoId) {
		photoId = event.queryStringParameters?.photoId;
	}

	const headers = {
		"Content-Type": "application/json; charset=utf-8",
		"X-Total-Count": 0
	};

	try {
		[API_URL, API_TOKEN] = await Promise.all([
			getParameter('/argenpills/prod/aireviews/reviews_endpoint', SSMClient),
			getParameter('/argenpills/prod/aireviews/reviews_token', SSMClient)
		]);

		const response = await fetch(`${API_URL}/postreviewtoforum`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-api-secret-token': `${API_TOKEN}`
			},
			body: JSON.stringify({ photoId })
		});

		if (!response.ok) {
			throw new Error(`API responded with status: ${response.status}`);
		}

		const data = await response.json();

		return {
			headers,
			statusCode: 200,
			body: JSON.stringify({
				data: data || [],
			})
		};

	} catch (err) {
		console.log("ERROR", err);
		return {
			headers,
			statusCode: 500,
			body: JSON.stringify({
				message: err.message
			})
		};
	}
};


exports.handler = async (event, context) => {
	const ssmClient = new SSMClient({ region: 'us-east-1' });

	return exports.Testeablehandler(event, context, ssmClient);
};

