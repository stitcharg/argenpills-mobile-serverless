# Cognito

Para la autenticacion/autorizacion estamos usando AWS Cognito. 

Pulumi se va a encargar de generar toda la logica, pero agregar los usuarios es algo que hay que hacer a mano. 
La consola es bastante limitada, asi que vamos a tener que hacer unos pasos extras

1. Agregar el usuario en el User Pool. Elegir un password determinado
2. Va a aparecer como "Force change password". Eso no se puede cambiar desde la consola
3. Ejecutar el siguiente comando para setear el password de ese usuario
```
aws cognito-idp admin-set-user-password \
    --user-pool-id <UserPoolId> \
    --username <Username> \
    --password <NewPassword> \
    --permanent
```
4. Hay que tener en cuenta que el client pool tiene que tener los permisos de ALLOW_REFRESH_TOKEN_AUTH y ALLOW_ADMIN_USER_PASSWORD_AUTH 