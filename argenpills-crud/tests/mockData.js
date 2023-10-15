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
		  "S": "/pills/818730.jpg"
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

module.exports = {
	mockGetItemsResponse,
	mockSearchResults,
	mockSingleItemResponse,
	mockPutItemResult
}

