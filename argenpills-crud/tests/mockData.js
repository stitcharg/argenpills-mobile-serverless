const mockGetItemsResponse = {
	"Count": 2,
	"Items": [
		{
			"published": "x",
			"ap_url": "https://argenpills.org/showthread.php?tid=7290",
			"image": "/pills/6406701.jpg",
			"search_value": "monster verde",
			"notes": "Parecen tener buen laqueado. No sabemos si tienen linea divisoria, o tienen algún mensaje en la parte de atrás.",
			"id": "206374e8-2a14-4d9a-a9c0-70293aa6e7db",
			"posted_date": "2023-09-05",
			"name": "Monster",
			"color": "Verde"
		},
		{
			"published": "x",
			"ap_url": "https://argenpills.org/showthread.php?tid=111",
			"image": "/pills/0.jpg",
			"search_value": "pepe amarillo",
			"notes": "Nota de ejemplo",
			"id": "206374e8-2a14-4d8a-a9c0-70293aa6e7db",
			"posted_date": "2023-01-01",
			"name": "Pepe",
			"color": "amarillo"
		}
	]
}

const mockSingleItemResponse = {
	"Item":
	{
		"published": "x",
		"ap_url": "https://argenpills.org/showthread.php?tid=111",
		"image": "/pills/0.jpg",
		"search_value": "pepe amarillo",
		"notes": "Nota de ejemplo",
		"id": "206374e8-2a14-4d8a-a9c0-70293aa6e7db",
		"posted_date": "2023-01-01",
		"name": "Pepe",
		"color": "amarillo"
	}

}

const mockSearchResults = {
	"Count": 1,
	"Items": [
		{
			"published": "x",
			"ap_url": "https://argenpills.org/showthread.php?tid=111",
			"image": "/pills/0.jpg",
			"search_value": "pepe amarillo",
			"notes": "Nota de ejemplo",
			"id": "206374e8-2a14-4d8a-a9c0-70293aa6e7db",
			"posted_date": "2023-01-01",
			"name": "Pepe",
			"color": "amarillo"
		}
	]
}

const mockPutItemResult = {
	"ConsumedCapacity": {
		"CapacityUnits": 1,
		"TableName": "argenpills"
	}
}

module.exports = {
	mockGetItemsResponse,
	mockSearchResults,
	mockSingleItemResponse,
	mockPutItemResult
}

