# Infra as code

## Cambiar de stack
```
pulumi stack select dev

pulumi stack select prod
```

## Profiles
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
```
