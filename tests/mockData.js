const mockGetItemsResponse = {
	"$metadata": {
		"httpStatusCode": 200,
		"requestId": "F8L2107FA8BTQM1LBR3PTG2VDNVV4KQNSO5AEMVJF66Q9ASUAAJG",
		"attempts": 1,
		"totalRetryDelay": 0
	},
	"Count": 2,
	"Items": [
		{
			"published": {
				"S": "x"
			},
			"ap_url": {
				"S": "https://argenpills.org/showthread.php?tid=1111"
			},
			"search_value": {
				"S": "red bull verde"
			},
			"lab_url": {
				"S": ""
			},
			"load": {
				"N": "1"
			},
			"posted_date": {
				"S": "2023-02-02"
			},
			"name": {
				"S": "Pepe"
			},
			"substance": {
				"N": "1"
			},
			"image": {
				"S": "/pills/818730.jpg"
			},
			"notes": {
				"S": "Linea divisoria"
			},
			"multiple_batchs": {
				"BOOL": false
			},
			"lab_image": {
				"S": "/pills/818730.jpg"
			},
			"id": {
				"S": "787f23d3-7f90-4394-8ea8-af32e1ad3e6a"
			},
			"warning": {
				"N": "1"
			},
			"color": {
				"S": "Verde"
			}
		},
		{
			"published": {
				"S": "x"
			},
			"ap_url": {
				"S": "https://argenpills.org/showthread.php?tid=2222"
			},
			"search_value": {
				"S": "red bull azul"
			},
			"lab_url": {
				"S": ""
			},
			"load": {
				"N": "1"
			},
			"posted_date": {
				"S": "2023-02-02"
			},
			"name": {
				"S": "Red Bull"
			},
			"substance": {
				"N": "1"
			},
			"image": {
				"S": "/pills/818730.jpg"
			},
			"notes": {
				"S": "Linea divisoria"
			},
			"multiple_batchs": {
				"BOOL": false
			},
			"lab_image": {
				"S": "/pills/818730.jpg"
			},
			"id": {
				"S": "787f23d3-7f90-4394-8ea8-af32e1ad3e6a"
			},
			"warning": {
				"N": "1"
			},
			"color": {
				"S": "Azul"
			}
		}
	],
	"ScannedCount": 1
}

const mockItemNotFound = {
	"$metadata": {
		"httpStatusCode": 404,
		"requestId": "RB4P3VCKKMC3NSQ6MTUJAGLJ5JVV4KQNSO5AEMVJF66Q9ASUAAJG",
		"attempts": 1,
		"totalRetryDelay": 0
	}
}

const mockSingleItemResponse = {
	"$metadata": {
		"httpStatusCode": 200,
		"requestId": "RB4P3VCKKMC3NSQ6MTUJAGLJ5JVV4KQNSO5AEMVJF66Q9ASUAAJG",
		"attempts": 1,
		"totalRetryDelay": 0
	},
	"Item": {
		"published": {
			"S": "x"
		},
		"ap_url": {
			"S": "https://argenpills.org/showthread.php?tid=6832"
		},
		"search_value": {
			"S": "Pepe roja"
		},
		"lab_url": {
			"S": ""
		},
		"load": {
			"N": "1"
		},
		"posted_date": {
			"S": "2023-02-02"
		},
		"name": {
			"S": "Pepe"
		},
		"substance": {
			"N": "1"
		},
		"image": {
			"S": "/pills/818730.jpg"
		},
		"notes": {
			"S": "Linea divisoria"
		},
		"multiple_batchs": {
			"BOOL": false
		},
		"lab_image": {
			"S": "/pills/818734.jpg"
		},
		"id": {
			"S": "787f23d3-7f90-4394-8ea8-af32e1ad3e6a"
		},
		"warning": {
			"N": "1"
		},
		"color": {
			"S": "Roja"
		}
	}
}

const mockSingleItemResponseSpecialChars = {
	...mockSingleItemResponse,
	"Item": {
		"name": { "S": "Pepe éáíñ" },
		"notes": { "S": "Acentos y éáíñ" },
		"color": { "S": "amarillo éáíñ" },
	}
};

const mockSearchResults = {
	"$metadata": {
		"httpStatusCode": 200,
		"requestId": "F8L2107FA8BTQM1LBR3PTG2VDNVV4KQNSO5AEMVJF66Q9ASUAAJG",
		"attempts": 1,
		"totalRetryDelay": 0
	},
	"Count": 1,
	"Items": [
		{
			"published": {
				"S": "x"
			},
			"ap_url": {
				"S": "https://argenpills.org/showthread.php?tid=1111"
			},
			"search_value": {
				"S": "red bull amarillo"
			},
			"lab_url": {
				"S": ""
			},
			"load": {
				"N": "1"
			},
			"posted_date": {
				"S": "2023-02-02"
			},
			"name": {
				"S": "Red Bull"
			},
			"substance": {
				"N": "1"
			},
			"image": {
				"S": "/pills/818730.jpg"
			},
			"notes": {
				"S": "Linea divisoria"
			},
			"multiple_batchs": {
				"BOOL": false
			},
			"lab_image": {
				"S": "/pills/818730.jpg"
			},
			"id": {
				"S": "787f23d3-7f90-4394-8ea8-af32e1ad3e6a"
			},
			"warning": {
				"N": "1"
			},
			"color": {
				"S": "amarillo"
			}
		}
	]
}

const mockPutItemResult = {
	"ConsumedCapacity": {
		"CapacityUnits": 1,
		"TableName": "argenpills"
	}
}

const mockDashboardColors = {
	"$metadata": {
		"httpStatusCode": 200,
		"requestId": "F8L2107FA8BTQM1LBR3PTG2VDNVV4KQNSO5AEMVJF66Q9ASUAAJG",
		"attempts": 1,
		"totalRetryDelay": 0
	},
	"Count": 2,
	"Items": [
		{
			"published": {
				"S": "x"
			},
			"ap_url": {
				"S": "https://argenpills.org/showthread.php?tid=1111"
			},
			"search_value": {
				"S": "red bull amarillo"
			},
			"lab_url": {
				"S": ""
			},
			"load": {
				"N": "1"
			},
			"posted_date": {
				"S": "2023-02-02"
			},
			"name": {
				"S": "Red Bull"
			},
			"substance": {
				"N": "1"
			},
			"image": {
				"S": "/pills/818730.jpg"
			},
			"notes": {
				"S": "Linea divisoria"
			},
			"multiple_batchs": {
				"BOOL": false
			},
			"lab_image": {
				"S": "/pills/818730.jpg"
			},
			"id": {
				"S": "787f23d3-7f90-4394-8ea8-af32e1ad3e6a"
			},
			"warning": {
				"N": "1"
			},
			"color": {
				"S": "amarillo"
			}
		},
		{
			"published": {
				"S": "x"
			},
			"ap_url": {
				"S": "https://argenpills.org/showthread.php?tid=1111"
			},
			"search_value": {
				"S": "red bull roja"
			},
			"lab_url": {
				"S": ""
			},
			"load": {
				"N": "1"
			},
			"posted_date": {
				"S": "2023-02-02"
			},
			"name": {
				"S": "Red Bull"
			},
			"substance": {
				"N": "1"
			},
			"image": {
				"S": "/pills/818730.jpg"
			},
			"notes": {
				"S": "Linea divisoria"
			},
			"multiple_batchs": {
				"BOOL": false
			},
			"lab_image": {
				"S": "/pills/818730.jpg"
			},
			"id": {
				"S": "787f23d3-7f90-4394-8ea8-af32e1ad3e6a"
			},
			"warning": {
				"N": "1"
			},
			"color": {
				"S": "roja"
			}
		},
		,
		{
			"published": {
				"S": "x"
			},
			"ap_url": {
				"S": "https://argenpills.org/showthread.php?tid=1111"
			},
			"search_value": {
				"S": "red bull violeta"
			},
			"lab_url": {
				"S": ""
			},
			"load": {
				"N": "1"
			},
			"posted_date": {
				"S": "2023-01-01"
			},
			"name": {
				"S": "Red Bull"
			},
			"substance": {
				"N": "1"
			},
			"image": {
				"S": "/pills/818730.jpg"
			},
			"notes": {
				"S": "Linea divisoria"
			},
			"multiple_batchs": {
				"BOOL": false
			},
			"lab_image": {
				"S": "/pills/818730.jpg"
			},
			"id": {
				"S": "787f23d3-7a90-4394-8ea8-af32e1ad3e6a"
			},
			"warning": {
				"N": "1"
			},
			"color": {
				"S": "violeta"
			}
		}
	]
}

const mockAllItemsData = {
	'$metadata': {
		"httpStatusCode": 200,
		"requestId": '2B4FP9BMCILC7IBBBDNFP2BF1FVV4KQNSO5AEMVJF66Q9ASUAAJG',
		"extendedRequestId": undefined,
		"cfId": undefined,
		"attempts": 1,
		"totalRetryDelay": 0
	},
	"LastEvaluatedKey": {
		"posted_date": {
			"S": "2023-08-01"
		},
		"id": {
			"S": "e17b56df-6269-4a80-a17e-78841c1b69ac"
		},
		"published": {
			"S": "x"
		}
	},
	"Count": 10,
	"Items": [
		{
			"published": { "S": 'x' },
			"ap_url": { "S": 'https://argenpills.org/showthread.php?tid=6832' },
			"search_value": { "S": 'red bull verde' },
			"lab_url": { "S": '' },
			"load": { "N": 0 },
			"posted_date": { "S": '2023-02-02' },
			"name": { "S": 'Red Bull' },
			"substance": { "N": 1 },
			"image": { "S": '/pills/818730.jpg' },
			"notes": { "S": 'Linea divisoria' },
			"multiple_batchs": { "BOOL": false },
			"lab_image": { "S": '/tests/1566443.jpg' },
			"id": { "S": '787f23d3-7f90-4394-8ea8-af32e1ad3e6a' },
			"warning": { "N": 0 },
			"color": { "S": 'Verde' }
		},
		{
			"published": { "S": 'x' },
			"ap_url": { "S": 'https://argenpills.org/showthread.php?tid=6805' },
			"search_value": { "S": 'iphonex bi"color" (rosa y blanco)' },
			"lab_url": { "S": 'null' },
			"load": { "N": 0 },
			"posted_date": { "S": '2023-01-16' },
			"name": { "S": 'iPhoneX' },
			"substance": { "N": 0 },
			"image": { "S": '/pills/1297981.jpg' },
			"notes": { "S": 'Linea divisoria' },
			"multiple_batchs": { "BOOL": false },
			"lab_image": { "S": '' },
			"id": { "S": '7a6a496e-a916-4e32-92bb-df5eb64e02db' },
			"warning": { "N": 0 },
			"color": { "S": 'Bi"color" (Rosa y Blanco)' }
		},
		{
			"published": { "S": 'x' },
			"ap_url": { "S": 'https://argenpills.org/showthread.php?tid=6008' },
			"search_value": { "S": 'tomorrowland rosa' },
			"lab_url": { "S": '' },
			"load": { "N": '2' },
			"posted_date": { "S": '2022-01-28' },
			"name": { "S": 'Tomorrowland' },
			"substance": { "N": 1 },
			"image": { "S": '/pills/4805300.jpg' },
			"notes": { "S": '' },
			"multiple_batchs": { "BOOL": false },
			"lab_image": { "S": '' },
			"id": { "S": 'ce0793db-d0d1-4c53-90dc-9456678e172d' },
			"warning": { "N": 0 },
			"color": { "S": 'Rosa' }
		},
		{
			"published": { "S": 'x' },
			"ap_url": { "S": 'https://argenpills.org/showthread.php?tid=6875' },
			"search_value": { "S": 'ferrari naranja' },
			"lab_url": { "S": '' },
			"load": { "N": 0 },
			"posted_date": { "S": '2023-02-08' },
			"name": { "S": 'Ferrari' },
			"substance": { "N": 0 },
			"image": { "S": '/pills/5593856.jpg' },
			"notes": { "S": 'Tiene linea divisoria. No parecen tener buen laqueado.' },
			"multiple_batchs": { "BOOL": false },
			"lab_image": { "S": '/tests/4154060.jpg' },
			"id": { "S": 'cc065bd4-e34f-46fb-92f0-749cdd5fc278' },
			"warning": { "N": 0 },
			"color": { "S": 'Naranja' }
		},
		{
			"published": { "S": 'x' },
			"ap_url": { "S": 'https://argenpills.org/showthread.php?tid=6179' },
			"search_value": { "S": 'tomorrowland amarilla' },
			"lab_url": { "S": '' },
			"load": { "N": 0 },
			"posted_date": { "S": '2022-03-24' },
			"name": { "S": 'Tomorrowland' },
			"substance": { "N": 1 },
			"image": { "S": '/pills/1383259.jpg' },
			"notes": { "S": '' },
			"multiple_batchs": { "BOOL": false },
			"lab_image": { "S": '/tests/2368119.jpg' },
			"id": { "S": '626e4460-469a-4863-a26f-84f58a2442f6' },
			"warning": { "N": 0 },
			"color": { "S": 'Amarilla' }
		},
		{
			"published": { "S": 'x' },
			"ap_url": { "S": 'https://argenpills.org/showthread.php?tid=7320' },
			"search_value": { "S": 'punisher rosa' },
			"lab_url": { "S": '' },
			"load": { "N": 0 },
			"posted_date": { "S": '2023-09-18' },
			"name": { "S": 'Punisher' },
			"substance": { "N": 0 },
			"image": { "S": '/pills/7363443.jpg' },
			"notes": { "S": '"Buen laqueado, tienen linea divisoria"' },
			"multiple_batchs": { "BOOL": false },
			"lab_image": { "S": '' },
			"id": { "S": '9fddfed3-b7ef-4fb1-bf19-78f3d3e88aaa' },
			"warning": { "N": 0 },
			"color": { "S": 'Rosa' }
		},
		{
			"published": { "S": 'x' },
			"ap_url": { "S": 'https://argenpills.org/showthread.php?tid=6663' },
			"search_value": { "S": 'tesla bi"color" (amarilla / verde)' },
			"lab_url": { "S": '' },
			"load": { "N": 0 },
			"posted_date": { "S": '2022-11-25' },
			"name": { "S": 'Tesla' },
			"substance": { "N": 0 },
			"image": { "S": '/pills/7003943.jpg' },
			"notes": { "S": '' },
			"multiple_batchs": { "BOOL": false },
			"lab_image": { "S": '' },
			"id": { "S": '757da16f-98a6-4091-9801-49b7c9cea481' },
			"warning": { "N": 0 },
			"color": { "S": 'Bi"color" (Amarilla / Verde)' }
		},
		{
			"published": { "S": 'x' },
			"ap_url": { "S": 'https://argenpills.org/showthread.php?tid=5935' },
			"search_value": { "S": 'darth vader rosas' },
			"lab_url": { "S": '' },
			"load": { "N": '2' },
			"posted_date": { "S": '2021-12-23' },
			"name": { "S": 'Darth Vader' },
			"substance": { "N": 1 },
			"image": { "S": '/pills/3460605.jpg' },
			"notes": { "S": '' },
			"multiple_batchs": { "BOOL": false },
			"lab_image": { "S": '/tests/8627219.jpg' },
			"id": { "S": '86d72918-4b4c-46bd-b713-cb91ceee1e86' },
			"warning": { "N": 0 },
			"color": { "S": 'Rosa' }
		},
		{
			"published": { "S": 'x' },
			"ap_url": { "S": 'https://argenpills.org/showthread.php?tid=7092' },
			"search_value": { "S": 'valentino rossi vr amarilla' },
			"lab_url": { "S": '' },
			"load": { "N": 0 },
			"posted_date": { "S": '2023-06-16' },
			"name": { "S": 'Valentino Rossi VR' },
			"substance": { "N": 1 },
			"image": { "S": '/pills/7348014.jpg' },
			"notes": {
				S: '"Es una tortuga con el numero ""46"" marcado (logo viejo de Valentino Rossi). Tiene linea divisoria."'
			},
			"multiple_batchs": { "BOOL": false },
			"lab_image": { "S": '/tests/3320694.jpg' },
			"id": { "S": '2d26f01b-c657-4b63-aad1-0195cc949cb0' },
			"warning": { "N": 0 },
			"color": { "S": 'Amarilla' }
		},
	]

};

const mockPagedData = {
	'$metadata': {
		"httpStatusCode": 200,
		"requestId": '2B4FP9BMCILC7IBBBDNFP2BF1FVV4KQNSO5AEMVJF66Q9ASUAAJG',
		"extendedRequestId": undefined,
		"cfId": undefined,
		"attempts": 1,
		"totalRetryDelay": 0
	},
	"LastEvaluatedKey": {
		"posted_date": {
			"S": "2022-03-24"
		},
		"id": {
			"S": "626e4460-469a-4863-a26f-84f58a2442f6"
		},
		"published": {
			"S": "x"
		}
	},
	"Count": 5,
	"Items": [
		{
			"published": { "S": 'x' },
			"ap_url": { "S": 'https://argenpills.org/showthread.php?tid=6832' },
			"search_value": { "S": 'red bull verde' },
			"lab_url": { "S": '' },
			"load": { "N": 0 },
			"posted_date": { "S": '2023-02-02' },
			"name": { "S": 'Red Bull' },
			"substance": { "N": 1 },
			"image": { "S": '/pills/818730.jpg' },
			"notes": { "S": 'Linea divisoria' },
			"multiple_batchs": { "BOOL": false },
			"lab_image": { "S": '/tests/1566443.jpg' },
			"id": { "S": '787f23d3-7f90-4394-8ea8-af32e1ad3e6a' },
			"warning": { "N": 0 },
			"color": { "S": 'Verde' }
		},
		{
			"published": { "S": 'x' },
			"ap_url": { "S": 'https://argenpills.org/showthread.php?tid=6805' },
			"search_value": { "S": 'iphonex bi"color" (rosa y blanco)' },
			"lab_url": { "S": 'null' },
			"load": { "N": 0 },
			"posted_date": { "S": '2023-01-16' },
			"name": { "S": 'iPhoneX' },
			"substance": { "N": 0 },
			"image": { "S": '/pills/1297981.jpg' },
			"notes": { "S": 'Linea divisoria' },
			"multiple_batchs": { "BOOL": false },
			"lab_image": { "S": '' },
			"id": { "S": '7a6a496e-a916-4e32-92bb-df5eb64e02db' },
			"warning": { "N": 0 },
			"color": { "S": 'Bi"color" (Rosa y Blanco)' }
		},
		{
			"published": { "S": 'x' },
			"ap_url": { "S": 'https://argenpills.org/showthread.php?tid=6008' },
			"search_value": { "S": 'tomorrowland rosa' },
			"lab_url": { "S": '' },
			"load": { "N": '2' },
			"posted_date": { "S": '2022-01-28' },
			"name": { "S": 'Tomorrowland' },
			"substance": { "N": 1 },
			"image": { "S": '/pills/4805300.jpg' },
			"notes": { "S": '' },
			"multiple_batchs": { "BOOL": false },
			"lab_image": { "S": '' },
			"id": { "S": 'ce0793db-d0d1-4c53-90dc-9456678e172d' },
			"warning": { "N": 0 },
			"color": { "S": 'Rosa' }
		},
		{
			"published": { "S": 'x' },
			"ap_url": { "S": 'https://argenpills.org/showthread.php?tid=6875' },
			"search_value": { "S": 'ferrari naranja' },
			"lab_url": { "S": '' },
			"load": { "N": 0 },
			"posted_date": { "S": '2023-02-08' },
			"name": { "S": 'Ferrari' },
			"substance": { "N": 0 },
			"image": { "S": '/pills/5593856.jpg' },
			"notes": { "S": 'Tiene linea divisoria. No parecen tener buen laqueado.' },
			"multiple_batchs": { "BOOL": false },
			"lab_image": { "S": '/tests/4154060.jpg' },
			"id": { "S": 'cc065bd4-e34f-46fb-92f0-749cdd5fc278' },
			"warning": { "N": 0 },
			"color": { "S": 'Naranja' }
		},
		{
			"published": { "S": 'x' },
			"ap_url": { "S": 'https://argenpills.org/showthread.php?tid=6179' },
			"search_value": { "S": 'tomorrowland amarilla' },
			"lab_url": { "S": '' },
			"load": { "N": 0 },
			"posted_date": { "S": '2022-03-24' },
			"name": { "S": 'Tomorrowland' },
			"substance": { "N": 1 },
			"image": { "S": '/pills/1383259.jpg' },
			"notes": { "S": '' },
			"multiple_batchs": { "BOOL": false },
			"lab_image": { "S": '/tests/2368119.jpg' },
			"id": { "S": '626e4460-469a-4863-a26f-84f58a2442f6' },
			"warning": { "N": 0 },
			"color": { "S": 'Amarilla' }
		}
	]

};

const mockPagedDataSecondPage = {
	'$metadata': {
		"httpStatusCode": 200,
		"requestId": '2B4FP9BMCILC7IBBBDNFP2BF1FVV4KQNSO5AEMVJF66Q9ASUAAJG',
		"extendedRequestId": undefined,
		"cfId": undefined,
		"attempts": 1,
		"totalRetryDelay": 0
	},
	"LastEvaluatedKey": {
		"posted_date": {
			"S": "2022-03-24"
		},
		"id": {
			"S": "626e4460-469a-4863-a26f-84f58a2442f6"
		},
		"published": {
			"S": "x"
		}
	},
	"Count": 3,
	"Items": [
		{
			"published": { "S": 'x' },
			"ap_url": { "S": 'https://argenpills.org/showthread.php?tid=6008' },
			"search_value": { "S": 'tomorrowland rosa' },
			"lab_url": { "S": '' },
			"load": { "N": '2' },
			"posted_date": { "S": '2022-01-28' },
			"name": { "S": 'Tomorrowland' },
			"substance": { "N": 1 },
			"image": { "S": '/pills/4805300.jpg' },
			"notes": { "S": '' },
			"multiple_batchs": { "BOOL": false },
			"lab_image": { "S": '' },
			"id": { "S": 'ce0793db-d0d1-4c53-90dc-9456678e172d' },
			"warning": { "N": 0 },
			"color": { "S": 'Rosa' }
		},
		{
			"published": { "S": 'x' },
			"ap_url": { "S": 'https://argenpills.org/showthread.php?tid=6875' },
			"search_value": { "S": 'ferrari naranja' },
			"lab_url": { "S": '' },
			"load": { "N": 0 },
			"posted_date": { "S": '2023-02-08' },
			"name": { "S": 'Ferrari' },
			"substance": { "N": 0 },
			"image": { "S": '/pills/5593856.jpg' },
			"notes": { "S": 'Tiene linea divisoria. No parecen tener buen laqueado.' },
			"multiple_batchs": { "BOOL": false },
			"lab_image": { "S": '/tests/4154060.jpg' },
			"id": { "S": 'cc065bd4-e34f-46fb-92f0-749cdd5fc278' },
			"warning": { "N": 0 },
			"color": { "S": 'Naranja' }
		},
		{
			"published": { "S": 'x' },
			"ap_url": { "S": 'https://argenpills.org/showthread.php?tid=6179' },
			"search_value": { "S": 'tomorrowland amarilla' },
			"lab_url": { "S": '' },
			"load": { "N": 0 },
			"posted_date": { "S": '2022-03-24' },
			"name": { "S": 'Tomorrowland' },
			"substance": { "N": 1 },
			"image": { "S": '/pills/1383259.jpg' },
			"notes": { "S": '' },
			"multiple_batchs": { "BOOL": false },
			"lab_image": { "S": '/tests/2368119.jpg' },
			"id": { "S": '626e4460-469a-4863-a26f-84f58a2442f6' },
			"warning": { "N": 0 },
			"color": { "S": 'Amarilla' }
		}
	]

};

const mockTableDescription = {
	"Table": {
		"ItemCount": 9
	}
};

const mockSearchTableSample = {
	'$metadata': {
		"httpStatusCode": 200,
		"requestId": '2B4FP9BMCILC7IBBBDNFP2BF1FVV4KQNSO5AEMVJF66Q9ASUAAJG',
		"extendedRequestId": undefined,
		"cfId": undefined,
		"attempts": 1,
		"totalRetryDelay": 0
	},
	"Count": 1,
	"Items": [
		{
			"id": { "S": "49cf7362-84a9-4213-bc73-114edc1cb888" },
			"word": { "S": "amarilla" },
			"posted_date": { "S": "2021-12-08" },
			"record": {
				"S":
					"{\"published\":\"x\",\"ap_url\":\"https://argenpills.org/showthread.php?tid=5931\",\"image\":\"/pills/2669162.jpg\",\"posted_date\":\"2021-12-08\",\"id\":\"49cf7362-84a9-4213-bc73-114edc1cb888\",\"name\":\"Bitcoin\",\"color\":\"Amarilla\",\"substance\":1,\"load\":1,\"warning\":1,\"notes\":\"L\u00EDnea divisoria atr\u00E1s. Al parecer hay dos tandas. La que tiene Marquis hecho no pareciera poseer MDMA.\"}"
			}
		}
	]
}

module.exports = {
	mockGetItemsResponse,
	mockSearchResults,
	mockSingleItemResponse,
	mockPutItemResult,
	mockItemNotFound,
	mockDashboardColors,
	mockAllItemsData,
	mockPagedData,
	mockPagedDataSecondPage,
	mockTableDescription,
	mockSingleItemResponseSpecialChars,
	mockSearchTableSample
}