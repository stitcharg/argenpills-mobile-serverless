# Argenpills Mobile API
LAMBDA de Argenpills Mobile. Hecho en NodeJS 16x, preparado para correr en AWS

## Environment Variables
Hay dos variables de entorno:

| Variable      | Descripcion |
| ----------- | ----------- |
| `CDN_IMAGES` | Dominio de donde se leen las images. CF Distribution escuchando en el bucket       |
| `S3_BUCKET` | S3 Bucket donde se guardan las imagenes |

## AWS Secrets
Se necesitan dos secrets en AWS:

| Nombre | Descripcion |
| ----------- | ----------- |
| `/argenpills/dev/admin-password` | Password del admin |
| `/argenpills/dev/auth-token` | Token valido |

## S3 Buckets
Se necesita un bucket de S3 para guardar las imagenes. Ahi se guardan las fotos y los tests.

## Cloudfront distribution
Se necesita una distribucion de CF enfrente del bucket de S3 para servir las imagenes. Esta distribucion necesita un dominio, que se pone en `CDN_IMAGES`.

## API Gateway
Se usa un custom domain definido, para ser mas amigable

Hay 3 stages
- default (auto-deploy)
- dev
- v1

El sitio le pega a `/v1/`

## CORS
Por ahora permite todos los dominios, pero si veo abuso lo voy a cerrar solo a los sitios