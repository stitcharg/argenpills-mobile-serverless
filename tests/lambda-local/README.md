# LAMBDA-LOCAL

## Instrucciones

1. Instalar lambda-local `bun install lambda-local -g`
2. Usar el archivo .json correspondiente (el de `edititem.json` tiene una imagen subida)
3. Correr el comando (arreglar los paths obviamente)
```
lambda-local -l edititem.js -h handler -e edititem.json -E '{"AP_TABLE": "argenpills-pills-8c4b3e0", "CDN_IMAGES": "https://images.sandbox.argenpills.info", "S3_BUCKET": "images.sandbox.argenpills.info" }'
```


