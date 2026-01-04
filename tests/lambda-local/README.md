# LAMBDA-LOCAL

## Instrucciones

1. Instalar lambda-local `bun install lambda-local -g`
2. Usar el archivo .json correspondiente (el de `edititem.json` tiene una imagen subida)
3. Correr el comando (arreglar los paths obviamente)


## Commands

### Edit
```
lambda-local -l edititem.js -h handler -e ../../../tests/lambda-local/edititem.json -E '{"AP_TABLE": "argenpills-pills-8c4b3e0", "CDN_IMAGES": "https://images.sandbox.argenpills.info", "S3_BUCKET": "images.sandbox.argenpills.info" }'
```

### Search
```
lambda-local -l search.js -h handler -e ../../../tests/lambda-local/search.json -E '{"AP_TABLE": "argenpills-pills-search", "CDN_IMAGES": "https://images.sandbox.argenpills.info" }'
```

### AI Bot History
```
lambda-local -l aibothistory.js -h handler -e ../../../tests/lambda-local/aibothistory.json
```

### AI Training data
```
lambda-local -l trainingdata.js -h handler -e ../../../tests/lambda-local/get-trainingdata.json

lambda-local -l trainingdata.js -h handler -e ../../../tests/lambda-local/get-list-trainingdata.json

lambda-local -l trainingdata.js -h handler -e ../../../tests/lambda-local/post-trainingdata.json

lambda-local -l trainingdata.js -h handler -e ../../../tests/lambda-local/put-trainingdata.json

lambda-local -l trainingdata.js -h handler -e ../../../tests/lambda-local/delete-trainingdata.json
```

### Dashboard
```
lambda-local -l dashboard.js -h handler -e ../../../tests/lambda-local/dashboard.json -E '{"AP_TABLE": "argenpills-pills-8c4b3e0", "AP_AIBOT_HISTORY_TABLE": "telegram-bot-history"}'
```

### Facts
```
lambda-local -l listfacts.js -h handler -e ../../../tests/lambda-local/fact-get-list.json -E '{"TABLE_NAME": "AP-FactTable-df55711", "AWS_REGION": "us-east-1"}'
lambda-local -l getfact.js -h handler -e ../../../tests/lambda-local/fact-get-item.json -E '{"TABLE_NAME": "AP-FactTable-df55711", "AWS_REGION": "us-east-1"}'
lambda-local -l deletefact.js -h handler -e ../../../tests/lambda-local/fact-delete.json -E '{"TABLE_NAME": "AP-FactTable-df55711", "AWS_REGION": "us-east-1"}'
lambda-local -l addfact.js -h handler -e ../../../tests/lambda-local/fact-add.json -E '{"TABLE_NAME": "AP-FactTable-df55711", "AWS_REGION": "us-east-1"}'
lambda-local -l editfact.js -h handler -e ../../../tests/lambda-local/fact-update.json -E '{"TABLE_NAME": "AP-FactTable-df55711", "AWS_REGION": "us-east-1"}'
```
