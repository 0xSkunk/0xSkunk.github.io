---
title: Bash Cheatsgeet
category: Cheatsheet
date: 2026-10-11
tags: [bash, cheatsheet]
---

# Empezando en Bash

- Usa siempre el shebang `#!/usr/bin/env bash` al principio del script
- Activa el modo estricto para detener el script ante errores o variables no definidas
- `errexit` ignora fallos en condiciones, en comandos antes de `&&` o `||`, y en comandos negados con `!`

```bash

# ==========================================
#                EJEMPLO BASICO             
# ==========================================

#!/usr/bin/env bash
name="John"
echo "Hello $name!"


# ==========================================
#                MODO ESTRICTO              
# ==========================================

set -euo pipefail
IFS=$'\n\t'


# ==========================================
#             EJECUCION EN SHELL            
# ==========================================

echo "I'm in $(pwd)"           # Recomendado
echo "I'm in `pwd`"            # Obsoleto (deprecated)
echo "$(< file.txt)"           # Lee archivo sin crear subproceso (no fork)
echo "${ printf hi; }"         # Bash 5.3+, sin crear subproceso (no fork)


# ==========================================
#            EJECUCION CONDICIONAL          
# ==========================================

git commit && git push                 # Ejecuta el segundo si el primero tiene éxito
git commit || echo "Commit failed"     # Ejecuta el segundo si el primero falla

```


# Comentarios

- Siempre añadir un `#` seguido de un espacio para comentarios de una línea
- Usa `: '` seguido de `'` para bloques de comentarios multilínea

```bash
# Esto es un comentario de una sola línea

: '
Esto es un
comentario de
múltiples líneas
'
```


# Variables y asignación

- No dejes espacios alrededor del signo `=` al asignar variables
- Por regla general, pon tus variables entre comillas dobles `"$var"` salvo que contengan comodines (wildcards) o fragmentos de comandos a expandir

```bash

# ==========================================
#              ASIGNACION BASICA            
# ==========================================

name="John"
echo $name                 # Sin comillas (no recomendado)
echo "$name"               # Con comillas (recomendado)
echo "${name}!"            # Delimitando el nombre de la variable

# Sin comillas cuando se necesita expandir comodines o argumentos
wildcard="*.txt"
options="iv"
cp -$options$wildcard /tmp


# ==========================================
#             VARIABLES ESPECIALES          
# ==========================================

$?                  # Estado de salida de la última tarea
$!                  # PID de la última tarea en segundo plano $$                  # PID de la shell actual
$0                  # Nombre de la shell o del script
$_                  # Último argumento del comando anterior
${PIPESTATUS[n]}    # Estado de salida de comandos en tubería (array)
$EPOCHSECONDS       # Segundos desde la época Unix (Unix epoch)
$SRANDOM            # Número aleatorio de 32 bits

```


# Cadenas de texto y expansión

- Las comillas dobles `""` expanden variables; las simples `''` tratan el texto de forma literal
- Usa `$'...'` para interpretar secuencias de escape ANSI-C como `\n` o `\t`
- Un desplazamiento negativo al cortar cadenas necesita un espacio o paréntesis: `${name: -1}` o `${name:(-1)}`
- Omitir los dos puntos `:` en los valores por defecto elimina la comprobación de valores vacíos (nulos), evaluando solo si no está definida

```bash

# ==========================================
#            COMILLAS EN CADENAS            
# ==========================================

name="John"
echo "Hi $name"            # "Hi John"
echo 'Hi $name'            # "Hi $name"
echo $'Hi\nJohn'           # "Hi", salto de línea y luego "John"


# ==========================================
#             EXPANSION DE LLAVES           
# ==========================================

echo {A,B}                 # A B
echo {A,B}.js              # A.js B.js
echo {1..5}                # 1 2 3 4 5
echo {{1..3},{7..9}}       # 1 2 3 7 8 9


# ==========================================
#        EXPANSION BASICA E INDICES         
# ==========================================

name="John"
echo "${name}"             # "John"
echo "${#name}"            # 4 (Longitud de la cadena)
echo "${name/J/j}"         # "john" (Reemplazar)
echo "${name:0:2}"         # "Jo" (Cortar: posición, longitud)
echo "${name::2}"          # "Jo" (Cortar desde el inicio)
echo "${name::-1}"         # "Joh" (Eliminar el último carácter)
echo "${name:(-1)}"        # "n" (Desde la derecha)
echo "${name:(-2):1}"      # "h" (Desde la derecha con longitud)

length=2
echo "${name:0:length}"    # "Jo"

str="Hello world"
echo "${str:6:5}"          # "world"
echo "${str: -5:5}"        # "world"


# ==========================================
#            VALORES POR DEFECTO            
# ==========================================

echo "${food:-Cake}"       # $food, o "Cake" si no existe o está vacía
${foo:-val}                # $foo, o val si no está definida (o es nula)
${foo:=val}                # Asigna val a $foo si no está definida (o es nula)
${foo:+val}                # val si $foo está definida (y no es nula)
${foo:?message}            # Muestra error si $foo no está definida (o es nula)


# ==========================================
#          SUSTITUCION Y RECORTE            
# ==========================================

${foo%suffix}              # Elimina el sufijo más corto
${foo%%suffix}             # Elimina el sufijo más largo
${foo/%suffix}             # Elimina el sufijo (anclado al final)
${foo#prefix}              # Elimina el prefijo más corto
${foo##prefix}             # Elimina el prefijo más largo
${foo/#prefix}             # Elimina el prefijo (anclado al inicio)

${foo/from/to}             # Reemplaza la primera coincidencia
${foo//from/to}            # Reemplaza todas las coincidencias
${foo/%from/to}            # Reemplaza el sufijo
${foo/#from/to}            # Reemplaza el prefijo

# Ejemplo práctico con rutas de archivos
str="/path/to/foo.cpp"
echo "${str%.cpp}"         # "/path/to/foo"
echo "${str%.cpp}.o"       # "/path/to/foo.o"
echo "${str%/*}"           # "/path/to" (Directorio)
echo "${str##*.}"          # "cpp" (Extensión)
echo "${str##*/}"          # "foo.cpp" (Nombre base)
echo "${str#*/}"           # "path/to/foo.cpp"
echo "${str/foo/bar}"      # "/path/to/bar.cpp"

src="/path/to/foo.cpp"
base=${src##*/}            # "foo.cpp" (basename)
dir=${src\%$base}           # "/path/to/" (dirname)
dir=${src%/*}              # "/path/to" (dirname)


# ==========================================
#       MANIPULACION Y TRANSFORMACION       
# ==========================================

str="HELLO WORLD!"
echo "${str,}"             # "hELLO WORLD!" (Primera en minúscula)
echo "${str,,}"            # "hello world!" (Todo en minúsculas)

str="hello world!"
echo "${str^}"             # "Hello world!" (Primera en mayúscula)
echo "${str^^}"            # "HELLO WORLD!" (Todo en mayúsculas)

# Operadores de transformación
"${foo@Q}"                 # Entrecomillado, reutilizable como entrada
"${foo@U}"                 # Todo en mayúsculas
"${foo@L}"                 # Todo en minúsculas
"${foo@u}"                 # Primer carácter en mayúscula
"${foo@E}"                 # Expande secuencias de escape $'…'
"${foo@P}"                 # Expande como cadena de prompt
"${foo@A}"                 # Forma de asignación o declaración (declare)
"${foo@a}"                 # Flags de atributos de la variable
"${foo[@]@K}"              # Pares clave-valor entrecomillados
"${foo[@]@k}"              # Pares clave-valor separados


# ==========================================
#          INDIRECCION Y PREFIJOS           
# ==========================================

# Expansión de nombres por prefijo
prefix_a=one
prefix_b=two
echo "${!prefix_*}"        # "prefix_a prefix_b"

# Indirección (punteros)
name=joe
pointer=name
echo "${!pointer}"         # "joe"

```


# Números y operaciones

- Usa `$((...))` para evaluar expresiones aritméticas
- Puedes declarar una variable explícitamente como entero usando `declare -i`

```bash

# ==========================================
#           CALCULOS NUMERICOS              
# ==========================================

echo $((a + 200))          # Suma 200 a $a
echo $((RANDOM % 200))     # Número aleatorio entre 0 y 199

declare -i count           # Declarar como tipo entero (integer)
count+=1                   # Incrementar directamente

```


# Condicionales

- `[[` es una palabra clave de la shell que devuelve `0` (verdadero) o `1` (falso); cualquier comando con esa lógica de estado de salida también sirve
- `BASH_REMATCH` almacena la coincidencia completa de una expresión regular en el índice `0`, seguida de cada grupo de captura

```bash

# ==========================================
#              IF-ELIF-ELSE                 
# ==========================================

if [[ -z "$string" ]]; then
    echo "String is empty"
elif [[ -n "$string" ]]; then
    echo "String is not empty"
else
    echo "This never happens"
fi


# ==========================================
#       CONDICIONES DE CADENA Y NUMEROS     
# ==========================================

[[ -z STRING ]]            # Cadena vacía
[[ -n STRING ]]            # Cadena no vacía
[[ STRING == STRING ]]     # Igual (soporta patrones glob)
[[ STRING != STRING ]]     # Diferente de (soporta patrones glob)
[[ STRING =~ STRING ]]     # Coincidencia con expresión regular (Regex)

[[ NUM -eq NUM ]]          # Igual a (Equal)
[[ NUM -ne NUM ]]          # Diferente de (Not equal)
[[ NUM -lt NUM ]]          # Menor que (Less than)
[[ NUM -le NUM ]]          # Menor o igual que (Less than or equal)
[[ NUM -gt NUM ]]          # Mayor que (Greater than)
[[ NUM -ge NUM ]]          # Mayor o igual que (Greater than or equal)
(( NUM < NUM ))            # Comparación aritmética directa


# ==========================================
#       OPERADORES LOGICOS Y ESTADO         
# ==========================================

[[ -o noclobber ]]         # Si la opción OPTIONNAME está activada
[[ -v VAR ]]               # Si la variable VAR está definida
[[ ! EXPR ]]               # Negación lógica (Not)
[[ X && Y ]]               # Y lógico (And)
[[ X || Y ]]               # O lógico (Or)


# ==========================================
#          CONDICIONES DE ARCHIVOS          
# ==========================================

[[ -e FILE ]]              # El archivo existe
[[ -r FILE ]]              # Es legible (Readable)
[[ -h FILE ]]              # Es un enlace simbólico (Symlink)
[[ -d FILE ]]              # Es un directorio
[[ -w FILE ]]              # Es escribible (Writable)
[[ -s FILE ]]              # Su tamaño es mayor a 0 bytes
[[ -f FILE ]]              # Es un archivo regular
[[ -x FILE ]]              # Es ejecutable
[[ FILE1 -nt FILE2 ]]      # FILE1 es más reciente que FILE2
[[ FILE1 -ot FILE2 ]]      # FILE2 es más reciente que FILE1
[[ FILE1 -ef FILE2 ]]      # Son el mismo archivo (mismo inode)


# ==========================================
#           EJEMPLOS PRACTICOS              
# ==========================================

# Combinaciones
if [[ -n "$X" && -n "$Y" ]]; then
    echo "Both are set"
fi

# Igualdad de cadenas
if [[ "$A" == "$B" ]]; then
    echo "Equal"
fi

# Expresiones regulares y grupos de captura
if [[ "$date" =~ ^([0-9]{4}) ]]; then
    echo "${BASH_REMATCH[1]}"
fi

# Comparación aritmética
if (( a < b )); then
    echo "$a is smaller than$b"
fi

# Comprobar existencia de archivo
if [[ -e "file.txt" ]]; then
    echo "file exists"
fi

# Comprobar el resultado de un comando directamente
if ping -c 1 google.com; then
    echo "It appears you have a working internet connection"
fi

# Comprobar con grep silencioso (-q)
if grep -q 'foo' ~/.bash_history; then
    echo "You appear to have typed 'foo' in the past"
fi


# ==========================================
#                CASE / SWITCH              
# ==========================================

case "$1" in
    start | up)
        vagrant up
        ;;
    *)
        echo "Usage: $0 {start|stop|ssh}"
        ;;
esac

```


# Loops

- `read` dentro de una tubería (pipeline) se ejecuta en una subshell; usa `shopt -s lastpipe` (con `set +m` en modo interactivo) para mantener la última etapa en la shell actual

```bash

# ==========================================
#                    FOR                    
# ==========================================

# For básico iterando sobre archivos
for i in /etc/rc.*; do
    echo "$i"
done

# For estilo C
for ((i = 0; i < 100; i++)); do
    echo "$i"
done

# Iterar sobre un rango
for i in {1..5}; do
    echo "Welcome $i"
done

# Rango con salto (step size)
for i in {5..50..5}; do
    echo "Welcome $i"
done


# ==========================================
#             WHILE Y LECTURA               
# ==========================================

# Leer un archivo línea por línea
while IFS= read -r line; do
    echo "$line"
done < file.txt

# Cargar todas las líneas en un array directamente
mapfile -t lines < file.txt

# Bucle infinito
while true; do
    echo "Running forever..."
done

```


# Funciones

- En Bash, `return` solo devuelve códigos de estado numéricos (0 para éxito, 1-255 para error)
- Para devolver valores o cadenas, imprímelos con `echo` y captúralos con `$(...)`
- `"$@"` y `"$*"` deben ir entre comillas para comportarse de forma distinta; sin comillas hacen exactamente lo mismo

```bash

# ==========================================
#             DEFINIR FUNCIONES             
# ==========================================

myfunc() {
    echo "hello $1"
}

# Sintaxis alternativa (hace lo mismo)
function myfunc {
    echo "hello $1"
}

# Llamar a la función
myfunc "John"


# ==========================================
#             DEVOLVER VALORES              
# ==========================================

myfunc() {
    local myresult='some value'
    echo "$myresult"
}

result=$(myfunc)


# ==========================================
#         LANZAR ERRORES (ESTADOS)          
# ==========================================

myfunc() {
    return 1
}

if myfunc; then
    echo "success"
else
    echo "failure"
fi


# ==========================================
#           ARGUMENTOS DE FUNCION           
# ==========================================

$#     # Número de argumentos pasados
$*     # Todos los argumentos posicionales (como una sola palabra si se entrecomilla)
$@     # Todos los argumentos posicionales (como cadenas separadas si se entrecomilla)
$1     # Primer argumento
$_     # Último argumento del comando anterior

```


# Colecciones (Arrays y diccionarios)

- Bash soporta arrays indexados de una dimensión y arrays asociativos (diccionarios)
- `declare -A` crea un diccionario o array asociativo (requiere Bash 4+)

```bash

# ==========================================
#                  ARRAYS                   
# ==========================================

# Definir arrays
Fruits=('Apple' 'Banana' 'Orange')
Fruits[0]="Apple"
Fruits[1]="Banana"
Fruits[2]="Orange"

# Consultar elementos del array
echo "${Fruits[0]}"                   # Elemento #0 ("Apple")
echo "${Fruits[-1]}"                  # Último elemento ("Orange")
echo "${Fruits[@]}"                   # Todos los elementos
echo "${#Fruits[@]}"                  # Número total de elementos
echo "${#Fruits}"                     # Longitud del 1er elemento
echo "${#Fruits[3]}"                  # Longitud del elemento N
echo "${Fruits[@]:3:2}"               # Cortar desde posición 3, longitud 2
echo "${!Fruits[@]}"                  # Obtener todos los índices

# Operaciones con arrays
Fruits=("${Fruits[@]}" "Watermelon")  # Añadir al final (Push)
Fruits+=('Watermelon')                # También añade al final (Push)
Fruits=("${Fruits[@]/Ap*/}")          # Vacía los elementos que coincidan con el patrón
unset 'Fruits[2]'                     # Eliminar un elemento específico
Fruits=("${Fruits[@]}")               # Duplicar array
Fruits=("${Fruits[@]}" "${Veggies[@]}") # Concatenar dos arrays
mapfile -t lines < datafile           # Crear array con una línea por elemento

# Iterar sobre un array
for i in "${arrayName[@]}"; do
    echo "$i"
done


# ==========================================
#               DICCIONARIOS                
# ==========================================

# Definir un diccionario
declare -A sounds
sounds[dog]="bark"
sounds[cow]="moo"
sounds[bird]="tweet"
sounds[wolf]="howl"

# Trabajar con diccionarios
echo "${sounds[dog]}"                 # Valor de "dog" ("bark")
echo "${sounds[@]}"                   # Todos los valores
echo "${!sounds[@]}"                  # Todas las claves (keys)
echo "${#sounds[@]}"                  # Número de elementos
unset sounds[dog]                     # Eliminar la clave "dog"

# Iterar sobre los valores
for val in "${sounds[@]}"; do
    echo "$val"
done

# Iterar sobre las claves
for key in "${!sounds[@]}"; do
    echo "$key"
done

```


# Entrada, salida y redirecciones

- En `read`, `-r` mantiene las barras invertidas literales, `-p` muestra un mensaje (prompt) y `-s` oculta la entrada del usuario
- Heredoc (`<<EOF`) envía múltiples líneas a `stdin`; poner `'EOF'` entre comillas simples desactiva la expansión de variables
- La sustitución de procesos `<(...)` permite tratar la entrada o salida de un comando como si fuera un archivo

```bash

# ==========================================
#               REDIRECCIONES               
# ==========================================

python hello.py > output.txt          # stdout a un archivo (sobrescribe)
python hello.py >> output.txt         # stdout a un archivo (añade al final)
python hello.py 2> error.log          # stderr a un archivo
python hello.py 2>&1                  # stderr hacia stdout
python hello.py 2>/dev/null           # stderr a null (ignorar errores)
python hello.py >output.txt 2>&1      # stdout y stderr a archivo (igual que &>)
python hello.py &>/dev/null           # stdout y stderr a null
echo "$0: warning: too many" >&2      # Enviar mensaje de diagnóstico a stderr
python hello.py < foo.txt             # Pasar foo.txt como stdin para python


# ==========================================
#               LEER ENTRADA                
# ==========================================

read -r -p "Proceed? [y/n] " ans
IFS= read -s -r -p "Password: " pass  # Sin eco en pantalla
echo "$ans"
read -n 1 ans                         # Leer un solo carácter


# ==========================================
#           HEREDOC Y HERESTRING            
# ==========================================

# Heredoc
cat <<EOF
hello world
EOF

# Herestring (pasa una cadena directamente a stdin)
tr '[:lower:]' '[:upper:]' <<< "Will be uppercased, even $variable"


# ==========================================
#         SUSTITUCION DE PROCESOS           
# ==========================================

# Iterar sobre las líneas de salida de una función
while IFS= read -r line; do
    echo "$line"
done < <(myfunc)

# Comparar la salida de dos comandos sin crear archivos temporales
diff <(ls "$dir1") <(ls "$dir2")


# ==========================================
#             FORMATO Y TEXTO               
# ==========================================

# Impresión con formato (printf)
printf "Hello %s, I'm %s" Sven Olga                       # "Hello Sven, I'm Olga"
printf "1 + 1 = %d" 2                                     # "1 + 1 = 2"
printf "This is how you print a float: %f" 2              # "...: 2.000000"
printf '%s\n' '#!/bin/bash' 'echo hello' > file           # Se aplica a cada argumento
printf '%i+%i=%i\n' 1 2 3  4 5 9                          # "1+2=3" y "4+5=9"

# Transformar cadenas con tr
echo "Welcome To Devhints" | tr '[:lower:]' '[:upper:]'   # "WELCOME TO DEVHINTS"

# Opciones y clases de caracteres en tr:
# -c          Aplica operaciones a caracteres que no están en el conjunto
# -d          Elimina caracteres
# -s          Reemplaza caracteres repetidos por una sola ocurrencia
# -t          Trunca el primer conjunto al tamaño del segundo
# [:upper:]   Letras mayúsculas
# [:lower:]   Letras minúsculas
# [:digit:]   Dígitos numéricos
# [:space:]   Espacios en blanco
# [:alpha:]   Todas las letras
# [:alnum:]   Letras y dígitos

```


# Opciones de Shell y Globbing

- `globskipdots` viene activado por defecto desde Bash 5.2
- `GLOBSORT` elige el criterio de ordenación de globs (`name`, `size`, `mtime`), usando `-` para invertir el orden (Bash 5.3+)
- Define `GLOBIGNORE` con patrones separados por dos puntos `:` para excluirlos de las coincidencias

```bash

# ==========================================
#             OPCIONES DE SET               
# ==========================================

set -o noclobber           # Evita que '>' sobrescriba archivos existentes
set -o errexit             # Detiene la ejecución si ocurre un error
set -o pipefail            # Falla si cualquier comando de una tubería falla
set -o nounset             # Lanza error al usar variables no definidas


# ==========================================
#             OPCIONES DE GLOB              
# ==========================================

shopt -s nullglob          # Los globs sin coincidencias se eliminan
shopt -s failglob          # Los globs sin coincidencias lanzan un error
shopt -s nocaseglob        # Globs insensibles a mayúsculas/minúsculas
shopt -s dotglob           # Los comodines incluyen archivos ocultos (dotfiles)
shopt -s globstar          # Permite usar '**' para búsquedas recursivas
shopt -s extglob           # Patrones extendidos como @(a|b) o !(a)

```


# Historial

- `!!` y `!$` pueden reemplazarse con cualquier expansión válida como `!cat`, `!-2`, `!42`, etc.

```bash

# ==========================================
#          COMANDOS Y EXPANSIONES           
# ==========================================

history                    # Mostrar el historial de comandos
shopt -s histverify        # No ejecutar el resultado expandido inmediatamente

!$                         # Expande el último parámetro del comando más reciente
!*                         # Expande todos los parámetros del comando más reciente
!-n                        # Expande el enésimo comando más reciente
!n                         # Expande el comando número n en el historial
!<command>                 # Expande la invocación más reciente de <command>


# ==========================================
#         OPERACIONES Y RECORTE             
# ==========================================

!!                         # Ejecuta el último comando otra vez
!!:s/<FROM>/<TO>/          # Reemplaza la primera ocurrencia en el comando anterior
!!:gs/<FROM>/<TO>/         # Reemplaza todas las ocurrencias en el comando anterior
!$:t                       # Expande solo el nombre base (basename) del último parámetro
!$:h                       # Expande solo el directorio (dirname) del último parámetro

!!:n                       # Expande solo el token n (el comando es 0; el 1er arg es 1)
!^                         # Expande el primer argumento del comando más reciente
!!:n-m                     # Expande un rango de tokens del comando más reciente
!!:n-$                     # Expande desde el token n hasta el último

```


# Entorno, rutas y argumentos

- `BASH_SOURCE` apunta al archivo incluso cuando se carga mediante `source`
- `shopt -s bash_source_fullpath` (Bash 5.3+) convierte la ruta de `BASH_SOURCE` en absoluta
- Bash 5.3 añade `source -p dirs` para buscar en una lista separada por dos puntos en lugar de `$PATH`
- En `getopts`, `OPTARG` guarda el valor de la opción y `OPTIND` el índice del siguiente argumento

```bash

# ==========================================
#         DIRECTORIOS Y SUBSHELLS           
# ==========================================

# Ejecutar en una subshell sin afectar el directorio actual
(cd somedir; echo "I'm now in $PWD")
pwd                        # Sigue en el directorio original

# Volver al directorio anterior
pwd                        # /home/user/foo
cd bar/
pwd                        # /home/user/foo/bar
cd -
pwd                        # /home/user/foo

# Obtener directorio del script e importar archivos relativos
dir=${BASH_SOURCE[0]%/*}
source "${BASH_SOURCE[0]%/*}/../share/foo.sh"


# ==========================================
#       INSPECCION Y CAPTURA DE ERRORES     
# ==========================================

# Inspeccionar cómo se resolverá un comando
command -V cd              # "cd is a shell builtin"

# Capturar errores simples
trap 'echo Error at about $LINENO' ERR

# Capturar errores con traza de funciones
traperr() {
    echo "ERROR: ${BASH_SOURCE[1]} at about${BASH_LINENO[0]}"
}
set -o errtrace
trap traperr ERR


# ==========================================
#      PROCESAR OPCIONES Y ARGUMENTOS       
# ==========================================

# Opciones cortas con getopts
while getopts ":Vs:f" opt; do
    case $opt in
        V) echo "$version"; exit ;;
        s) string=$OPTARG ;;
        f) flag=1 ;;
        :) echo "Missing argument for -$OPTARG" >&2; exit 1 ;;
        *) echo "Usage: $0 [-V] [-s string] [-f]"; exit 1 ;;
    esac
done
shift $((OPTIND - 1))

# Opciones largas manuales
while [[ "$1" == -* && "$1" != "--" ]]; do
    case $1 in
        -V | --version) echo "$version"; exit ;;
        -s | --string) shift; string=$1 ;;
        -f | --flag) flag=1 ;;
    esac
    shift
done
if [[ "$1" == "--" ]]; then shift; fi

```