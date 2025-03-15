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
	let querystring = "";

	//No soporta paginacion por ahora, pero lo dejamos para el futuro
	const pageSize = parseInt(event.queryStringParameters?.pageSize) || 100;
	const lastKey = event.queryStringParameters?.lastKey;

	const date = event.queryStringParameters?.date;
	if (date)
		querystring = `?date=${date}`;

	const headers = {
		"Content-Type": "application/json; charset=utf-8",
		"X-Total-Count": 0
	};

	try {
		[API_URL, API_TOKEN] = await Promise.all([
			getParameter('/argenpills/prod/aibot/history_endpoint', SSMClient),
			getParameter('/argenpills/prod/aibot/history_token', SSMClient)
		]);

		//const response = await fetch(`${API_URL}?pageSize=${pageSize}${lastKey ? `&lastKey=${lastKey}` : ''}`, {
		const response = await fetch(`${API_URL}${querystring}`, {
			headers: {
				'x-api-secret-token': `${API_TOKEN}`
			}
		});

		if (!response.ok) {
			throw new Error(`API responded with status: ${response.status}`);
		}

		const data = await response.json();

		headers["X-Total-Count"] = 100;	//100 items por ahora, despues vemos response.headers.get('x-total-count') || 0;

		return {
			headers,
			statusCode: 200,
			body: JSON.stringify({
				data: data.history || [],
				//LastEvaluatedKey: data.lastKey || null
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

