const { SSMClient, GetParameterCommand } = require("@aws-sdk/client-ssm");
const { algoliasearch } = require('algoliasearch');

const PAGESIZE = 9;

async function getParameter(paramName, ssmClient) {
	const command = new GetParameterCommand({
		Name: paramName,
		WithDecryption: true
	});

	const response = await ssmClient.send(command);
	return response.Parameter.Value;
}

exports.Testeablehandler = async (event, context, ssmClient) => {
	let body;
	let statusCode = 200;
	let totalItems = 0;

	const headers = {
		"Content-Type": "application/json; charset=utf-8",
		"X-Total-Count": totalItems
	};

	//This is the URL where the images are hosted. In this case is a CF distribution
	const CDN_IMAGES = process.env.CDN_IMAGES;

	const queryParams = event.queryStringParameters;

	if (queryParams == null) {
		statusCode = 403;
		body = "Missing parameter";
	}
	else {
		const search = queryParams.s;

		if (search == null) {
			statusCode = 403;
			body = "Missing parameter";
		}
		else {
			try {
				// Get Algolia credentials from Parameter Store
				const [applicationId, searchKey, indexName] = await Promise.all([
					getParameter('/argenpills/prod/algolia/application_id', ssmClient),
					getParameter('/argenpills/prod/algolia/search_key', ssmClient),
					getParameter('/argenpills/prod/algolia/index_name', ssmClient)
				]);

				const client = algoliasearch(applicationId, searchKey);

				const { results } = await client.search({
					requests: [
						{
							indexName: indexName,
							query: search,
							hitsPerPage: PAGESIZE
						}
					]
				});

				//nbHits has the real amount but we don't support paging for now
				//const { hits, nbHits } = results[0];
				const { hits } = results[0];
				const nbHits = hits.length;

				//set the total items
				headers["X-Total-Count"] = nbHits;

				body = hits.map(row => {
					return row;
				});

				return {
					headers,
					statusCode: 200,
					body: JSON.stringify({
						data: body
					})
				};

			} catch (err) {
				console.log("ERROR SEARCHING", err);

				return {
					headers,
					statusCode: 500,
					body: JSON.stringify({
						message: err.message || err
					})
				};
			}
		}
	}

	return {
		statusCode,
		body,
		headers
	};
};

exports.handler = async (event, context) => {
	const ssmClient = new SSMClient({ region: process.env.AWS_REGION || 'us-east-1' });
	return exports.Testeablehandler(event, context, ssmClient);
};
