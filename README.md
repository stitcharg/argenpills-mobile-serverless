# Argenpills Mobile API
LAMBDA de Argenpills Mobile. Hecho en NodeJS 18x, preparado para correr en AWS, con infra-as-code con Pulumi

## Infrastructure
La infra va a crear todo lo necesario (API gateway, records en route 53, la tabla en dynamodb, roles, permisos, buckets, etc). 

Obviamente esta preparado para laburar con el dominio `argenpills.info`. 

### Entornos
Hay dos entornos: **prod** y **sandbox**. Cada uno es una cuenta diferente de AWS. 

### Cambiar de stack
```
pulumi stack select dev

pulumi stack select prod
```

### Profiles
Para que esto funcione hay que tener las keys de AWS seteadas, obviamente. Configurar con `aws configure --profile ap_dev / ap_prod`

1. Setear la variable de cada stack
```
pulumi config set aws:profile ap_dev --stack dev
pulumi config set aws:profile ap_prod --stack prod
```

2. Definir el profile actual
```
export AWS_PROFILE=ap_dev # For Linux/macOS
set AWS_PROFILE=ap.dev   # For Windows
```

3. Listo
```
pulumi up
...
pulumi preview
```

## LAMBDAS
Estan hecho en NodeJS usando AWS SDK V3. Validan el request con librerias.

### Environment Variables
Hay dos variables de entorno:

| Variable      | Descripcion |
| ----------- | ----------- |
| `CDN_IMAGES` | Dominio de donde se leen las images. CF Distribution escuchando en el bucket. Requiere el schema (https://...)       |
| `S3_BUCKET` | S3 Bucket donde se guardan las imagenes |

## Cognito
Se usa Cognito, para eso se usa el lambda de auth, la cual tiene 2 variables de environment

| Nombre | Descripcion |
| ----------- | ----------- |
| `CLIENT_ID` | ClientID del pool de Cognito |
| `POOL_ID` | Cognito Pool Id |

## S3 Buckets
Se necesita un bucket de S3 para guardar las imagenes. Ahi se guardan las fotos y los tests.

## Cloudfront distribution
Se necesita una distribucion de CF enfrente del bucket de S3 para servir las imagenes. Esta distribucion necesita un dominio, que se pone en `CDN_IMAGES`.

## API Gateway
Se usa un custom domain definido, para ser mas amigable

Hay un stage (v1) para mantener retrocompatibilidad de necesitarlo en el futuro. Sandbox no lo tiene por ahora, pero se puede agregar cambiando la configuracion de Pulumi

El sitio en PROD le pega a `/v1/` 

## CORS
Por ahora permite todos los dominios, pero si veo abuso lo voy a cerrar solo a los sitios

## Dashboard
Hay un dashboard bastante pavo creado para ver un poco el uso y acceso