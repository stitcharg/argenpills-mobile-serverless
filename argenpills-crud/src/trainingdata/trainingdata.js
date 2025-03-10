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

	//No soporta paginacion por ahora, pero lo dejamos para el futuro
	const pageSize = parseInt(event.queryStringParameters?.pageSize) || 100;
	const lastKey = event.queryStringParameters?.lastKey;

	const headers = {
		"Content-Type": "application/json; charset=utf-8",
		"X-Total-Count": 0
	};

	const HTTPMETHOD = event.requestContext.http.method;

	try {

		[API_URL, API_TOKEN] = await Promise.all([
			getParameter('/argenpills/prod/aibot/training_endpoint', SSMClient),
			getParameter('/argenpills/prod/aibot/training_token', SSMClient)
		]);

		switch (HTTPMETHOD) {
			case "GET":
				//const response = await fetch(`${API_URL}?pageSize=${pageSize}${lastKey ? `&lastKey=${lastKey}` : ''}`, {

				const id = event.pathParameters?.id ?? null;

				if (id == null) {
					//We need the list
					const response = await fetch(`${API_URL}`, {
						headers: {
							'x-api-secret-token': `${API_TOKEN}`
						},
						timeout: 10000
					});

					if (!response.ok) {
						throw new Error(`API responded with status: ${response.status}`);
					}

					const data = await response.json();

					headers["X-Total-Count"] = 2000;	//hardcode por ahora, despues vemos response.headers.get('x-total-count') || 0;

					return {
						headers,
						statusCode: 200,
						body: JSON.stringify({
							data: data.training_data || [],
							//LastEvaluatedKey: data.lastKey || null
						})
					};
				}
				else {
					//We need a get one
					const response = await fetch(`${API_URL}/${id}`, {
						headers: {
							'x-api-secret-token': `${API_TOKEN}`
						},
						timeout: 10000
					});

					if (!response.ok) {
						throw new Error(`API responded with status: ${response.status}`);
					}

					const data = await response.json();

					headers["X-Total-Count"] = 1;

					return {
						headers,
						statusCode: 200,
						body: JSON.stringify({
							data: data.training_data || [],
						})
					};
				}

			case "POST": {
				const body = JSON.parse(event.body);

				const postBody = JSON.stringify({
					"input": body.input,
					"output": body.output
				});

				const response = await fetch(`${API_URL}`, {
					headers: {
						'x-api-secret-token': `${API_TOKEN}`,
						'Content-Type': 'application/json'
					},
					method: 'POST',
					body: postBody,
					timeout: 10000
				});

				if (!response.ok) {
					throw new Error(`API responded with status: ${response.status}`);
				}

				const data = await response.json();

				headers["X-Total-Count"] = 1;

				return {
					headers,
					statusCode: 200,
					body: JSON.stringify({
						data: data.training_data || []
					})
				};
			}

			case "PUT": {
				const body = JSON.parse(event.body);
				const id = event.pathParameters.id;

				const postBody = JSON.stringify({
					"input": body.input,
					"output": body.output
				});

				const response = await fetch(`${API_URL}/${id}`, {
					headers: {
						'x-api-secret-token': `${API_TOKEN}`,
						'Content-Type': 'application/json'
					},
					method: 'PUT',
					body: postBody,
					timeout: 10000
				});

				if (!response.ok) {
					throw new Error(`API responded with status: ${response.status}`);
				}

				const data = await response.json();

				headers["X-Total-Count"] = 1;

				return {
					headers,
					statusCode: 200,
					body: JSON.stringify({
						data: data.training_data || []
					})
				};
			}

			case "DELETE": {
				const id = event.pathParameters.id;

				const response = await fetch(`${API_URL}/${id}`, {
					headers: {
						'x-api-secret-token': `${API_TOKEN}`,
						'Content-Type': 'application/json'
					},
					method: 'DELETE',
					body: JSON.stringify({ id: id }),
					timeout: 10000
				});

				if (!response.ok) {
					throw new Error(`API responded with status: ${response.status}`);
				}

				const data = await response.json();

				headers["X-Total-Count"] = 1;

				return {
					headers,
					statusCode: (data.success = "true" ? 200 : 500)
				};
			}
		}



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

