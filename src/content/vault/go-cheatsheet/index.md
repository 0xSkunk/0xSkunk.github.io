---
title: Go Cheatsgeet
category: Cheatsheet
date: 2026-11-16
tags: [go, cheatsheet]
---

# Empezando en Go

- Todo archivo ejecutable de Go pertenece al paquete `main` y arranca en la función `main()`
- `go work init` inicia un espacio de trabajo (workspace); `go tool pprof` analiza el rendimiento de un binario
- `GOTOOLCHAIN=auto` permite que `go.mod` elija una versión más reciente del compilador; `go telemetry local` mantiene los contadores en local

```go

// ==========================================
//                HOLA MUNDO                 
// ==========================================

package main

import "fmt"

func main() {
    message := greetMe("world")
    fmt.Println(message)
}

func greetMe(name string) string {
    return "Hello, " + name + "!"
}

```

```bash

# ==========================================
#             COMANDOS DE CONSOLA           
# ==========================================

\$ go mod init hello        # Inicializar un módulo nuevo
\$ go run .                 # Compilar y ejecutar directamente
\$ go build                 # Compilar el paquete actual
\$ go test ./...            # Ejecutar todos los tests del proyecto
\$ go vet ./...             # Reportar posibles errores o código sospechoso
\$ go fmt ./...             # Formatear el código de todos los paquetes
\$ go mod tidy              # Sincronizar y limpiar dependencias
\$ go doc fmt.Println       # Mostrar la documentación de una función o paquete

```


# Variables y constantes

- Las declaraciones cortas (`:=`) infieren el tipo automáticamente y solo funcionan dentro de funciones
- Las constantes pueden ser caracteres, cadenas de texto, booleanos o valores numéricos
- Usa `iota` para generar secuencias de constantes numéricas autoincrementales

```go

// ==========================================
//          DECLARACION DE VARIABLES         
// ==========================================

var msg string
var msg = "Hello, world!"
var msg string = "Hello, world!"

var x, y int
var x, y int = 1, 2
var x, msg = 1, "Hello, world!"

// Lista de declaraciones agrupadas
var (
    x int
    y = 20
    z int = 30
    d, e = 40, "Hello"
    f, g string
)

// Declaración corta (infiere el tipo)
msg := "Hello"
x, msg := 1, "Hello"


// ==========================================
//                 CONSTANTES                
// ==========================================

const Phi = 1.618
const Size int64 = 1024
const x, y = 1, 2

const (
    Pi = 3.14
    E  = 2.718
)

// Enumeración con iota (0, 1, 2...)
const (
    Sunday = iota
    Monday
    Tuesday
    Wednesday
    Thursday
    Friday
    Saturday
)

```


# Tipos de datos y punteros

- Las cadenas de texto son de tipo `string` y pueden definirse en múltiples líneas con acentos graves (backticks)
- `byte` es un alias para `uint8` y `rune` es un alias para `int32` (representa un punto de código Unicode)
- Los punteros apuntan a la dirección de memoria de una variable; Go tiene recolector de basura y no permite aritmética de punteros
- Desde Go 1.26, `new` acepta una expresión como valor inicial

```go

// ==========================================
//              CADENAS DE TEXTO             
// ==========================================

str := "Hello"
str := `Multiline
string`


// ==========================================
//                  NUMEROS                  
// ==========================================

// Tipos habituales
num := 3                   // int
num := 3.0                 // float64
num := 3 + 4i              // complex128
num := byte('a')           // byte (alias de uint8)
num := 'a'                 // rune (alias de int32)

// Otros tipos numéricos
var u uint = 7             // Entero sin signo (unsigned)
var p float32 = 22.7       // Flotante de 32 bits

// Funciones integradas útiles
lo := min(3, 9)            // 3
hi := max(3, 9)            // 9


// ==========================================
//            CONVERSION DE TIPOS            
// ==========================================

i := 2
f := float64(i)            // 2.0
u := uint(i)               // 2


// ==========================================
//                  PUNTEROS                 
// ==========================================

func main() {
    b := *getPointer()
    fmt.Println("Value is", b)   // Value is 234
}

func getPointer() (p *int) {
    a := 234
    return &a                    // Devuelve la dirección de memoria de a
}

// Crear punteros con new
p := new(int)
*p = 234

q := new(42)                     // Puntero a 42 (Go 1.26+)

```


# Colecciones (Arrays, Slices y Maps)

- Los arrays tienen un tamaño fijo definido en tiempo de compilación, mientras que los slices tienen tamaño dinámico
- El paquete `slices` incluye funciones genéricas para ordenar y buscar elementos
- En un `map`, buscar una clave que no existe devuelve el valor cero del tipo; el segundo valor (`ok`) indica si la clave existe realmente

```go

// ==========================================
//                   ARRAYS                  
// ==========================================

var numbers [5]int
numbers := [...]int{0, 0, 0, 0, 0}     // El compilador cuenta los elementos


// ==========================================
//                   SLICES                  
// ==========================================

slice := []int{2, 3, 4}
slice := []byte("Hello")

s := make([]int, 3, 5)                 // Longitud (len) 3, capacidad (cap) 5
s = append(s, 4)                       // Añadir elemento al final

// Utilidades del paquete slices
s := []int{3, 1, 2}
slices.Sort(s)                         // [1 2 3]
slices.Contains(s, 2)                  // true


// ==========================================
//                    MAPS                   
// ==========================================

m := map[string]int{"a": 1}
m["b"] = 2                             // Añadir o actualizar clave
delete(m, "a")                         // Eliminar clave
v, ok := m["b"]                        // Patrón comma-ok para comprobar existencia
clear(m)                               // Vaciar todo el mapa

```


# Condicionales

- Un `if` puede ejecutar una sentencia corta antes de evaluar la condición; las variables declaradas ahí solo existen dentro del bloque `if`
- En Go, los bloques `case` de un `switch` no pasan al siguiente por defecto (no hacen *fallthrough*), a menos que uses la palabra clave `fallthrough`

```go

// ==========================================
//                IF-ELSE IF                 
// ==========================================

if day == "sunday" || day == "saturday" {
    rest()
} else if day == "monday" && isTired() {
    groan()
} else {
    work()
}

// Declaración corta previa a la condición
if _, err := doThing(); err != nil {
    fmt.Println("Uh oh")
}


// ==========================================
//                   SWITCH                  
// ==========================================

switch day {
case "sunday":
    // No pasa al siguiente caso salvo que se indique explícitamente
    fallthrough
case "saturday":
    rest()
default:
    work()
}

```


# Loops

- Go solo tiene una estructura de bucle: `for` (se usa también como bucle `while` poniendo solo la condición)
- Desde Go 1.22, cada iteración del bucle crea sus propias variables locales y `range` también acepta un número entero
- Desde Go 1.23, `range` también acepta una función iteradora (paquete `iter`)

```go

// ==========================================
//                 FOR BASICO                
// ==========================================

for count := 0; count <= 10; count++ {
    fmt.Println("My counter is at", count)
}


// ==========================================
//                 FOR-RANGE                 
// ==========================================

// Iterar sobre un slice o array
entry := []string{"Jack", "John"}
for i, val := range entry {
    fmt.Printf("%d: %s\n", i, val)
}

// Iterar sobre un entero (Go 1.22+)
for i := range 3 {
    fmt.Println(i)                     // 0, 1, 2
}

// Iterar con funciones iteradoras (Go 1.23+)
nums := slices.Values([]int{1, 2, 3})
for n := range nums {
    fmt.Println(n)
}


// ==========================================
//               ESTILO WHILE                
// ==========================================

n := 0
for n < 42 {
    n += guess()
}

```


# Funciones

- Las funciones son ciudadanos de primera clase en Go (pueden asignarse a variables y pasarse como argumentos)
- Si defines los nombres de los valores de retorno en la firma de la función, un `return` vacío devolverá automáticamente esas variables

```go

// ==========================================
//          FUNCIONES Y RETORNOS             
// ==========================================

// Retorno de múltiples valores
func getMessage() (a, b string) {
    return "Hello", "World"
}
a, b := getMessage()

// Valores de retorno con nombre (naked return)
func split(sum int) (x, y int) {
    x = sum * 4 / 9
    y = sum - x
    return
}


// ==========================================
//        VARIADICAS Y LAMBDAS (ANONIMAS)    
// ==========================================

// Función variádica (acepta múltiples argumentos)
func sum(nums ...int) int {
    total := 0
    for _, n := range nums {
        total += n
    }
    return total
}
sum(1, 2, 3)                           // 6

// Función anónima (lambda)
myfunc := func() bool {
    return x > 10000
}

```


# Structs y métodos

- En Go no existen las clases, pero puedes definir `structs` y asociarles métodos mediante un receptor (receiver)
- Si el receptor es un puntero (`*Vertex`), el método puede modificar los valores originales de la instancia
- Si `v` es un puntero a un struct, escribir `v.X` es equivalente a `(*v).X`
- La composición (embedding) promueve los campos y métodos del tipo incrustado directamente al struct contenedor

```go

// ==========================================
//              DEFINIR STRUCTS              
// ==========================================

type Vertex struct {
    X int
    Y int
}

func main() {
    v := Vertex{1, 2}
    v.X = 4
    fmt.Println(v.X, v.Y)              // 4 2
}

// Literales de struct
v := Vertex{X: 1, Y: 2}                // Especificando nombres de campo
v := Vertex{1, 2}                      // Omitiendo los nombres
v := Vertex{X: 1}                      // Y toma su valor cero implícitamente (0)

// Punteros a structs
v := &Vertex{1, 2}
v.X = 2


// ==========================================
//            COMPOSICION (EMBEDDING)        
// ==========================================

type Base struct {
    ID int
}

type User struct {
    Base
    Name string
}

u := User{
    Base: Base{ID: 7},
    Name: "Ada",
}
fmt.Println(u.ID)                      // 7 (Campo promovido directamente)


// ==========================================
//                  METODOS                  
// ==========================================

type Vertex struct {
    X, Y float64
}

// Receptor por valor (no modifica el original)
func (v Vertex) Abs() float64 {
    return math.Sqrt(v.X*v.X + v.Y*v.Y)
}

v := Vertex{1, 2}
v.Abs()

// Receptor por puntero (muta la instancia original)
func (v *Vertex) Scale(f float64) {
    v.X = v.X * f
    v.Y = v.Y * f
}

v := Vertex{6, 12}
v.Scale(0.5)                           // v pasa a ser {3, 6}

```


# Interfaces

- Las interfaces se implementan de manera implícita: un tipo satisface una interfaz simplemente implementando todos sus métodos (sin usar palabras clave como `implements`)
- `any` es un alias para la interfaz vacía `interface{}` (añadido en Go 1.18)

```go

// ==========================================
//        DEFINICION E IMPLEMENTACION        
// ==========================================

type Shape interface {
    Area() float64
    Perimeter() float64
}

type Rectangle struct {
    Length, Width float64
}

// Rectangle implementa Shape implícitamente al definir sus métodos
func (r Rectangle) Area() float64 {
    return r.Length * r.Width
}

func (r Rectangle) Perimeter() float64 {
    return 2 * (r.Length + r.Width)
}

func main() {
    var r Shape = Rectangle{Length: 3, Width: 4}
    fmt.Printf("%T %v %v\n", r, r.Area(), r.Perimeter())
}


// ==========================================
//             ASERCION DE TIPOS             
// ==========================================

var v any = "hello"                    // any equivale a interface{}

// Comprobar y extraer el tipo concreto con comma-ok
s, ok := v.(string)
fmt.Println(s, ok)                     // "hello" true

// Switch de tipos (Type switch)
switch x := v.(type) {
case string:
    fmt.Println("string", x)
case int:
    fmt.Println("int", x)
}

```


# Genéricos

- Desde Go 1.24, los alias de tipos pueden recibir parámetros de tipo
- Go 1.27 permite que los métodos declaren sus propios parámetros de tipo adicionales
- El operador `~T` en una restricción acepta cualquier tipo cuyo tipo subyacente sea `T`

```go

// ==========================================
//            PARAMETROS DE TIPO             
// ==========================================

func Map[T, U any](xs []T, f func(T) U) []U {
    out := make([]U, 0, len(xs))
    for _, x := range xs {
        out = append(out, f(x))
    }
    return out
}

type Stack[T any] struct {
    items []T
}

// Método con su propio parámetro de tipo U (Go 1.27+)
func (s *Stack[T]) Map[U any](f func(T) U) []U {
    out := make([]U, 0, len(s.items))
    for _, v := range s.items {
        out = append(out, f(v))
    }
    return out
}

// Alias de tipo genérico (Go 1.24+)
type Set[T comparable] = map[T]struct{}


// ==========================================
//         RESTRICCIONES (CONSTRAINTS)       
// ==========================================

type Number interface {
    ~int | ~int64 | ~float64
}

func Sum[T Number](xs []T) T {
    var total T
    for _, x := range xs {
        total += x
    }
    return total
}

```


# Control de errores

- Go no usa bloques `try/catch`; los errores son valores que se devuelven y comprueban explícitamente
- El verbo `%w` en `fmt.Errorf` envuelve un error para que `errors.Is` y `errors.As` puedan inspeccionar la cadena de errores
- `defer` pospone la ejecución de una función hasta que la función que la contiene retorne (sus argumentos se evalúan inmediatamente al declarar el `defer`)
- `recover` detiene un `panic` y devuelve su valor, pero solo funciona dentro de una función diferida con `defer`

```go

// ==========================================
//             MANEJO DE ERRORES             
// ==========================================

err := errors.New("not found")
err = fmt.Errorf("load %q: %w", name, err)     // Envolver error con %w

// Comprobar si es un error específico
if errors.Is(err, os.ErrNotExist) {
    // Manejar error de archivo inexistente
}

// Extraer un tipo de error concreto
var pathErr *fs.PathError
if errors.As(err, &pathErr) {
    fmt.Println(pathErr.Path)
}

// Combinar múltiples errores en uno
err = errors.Join(err1, err2)


// ==========================================
//                   DEFER                   
// ==========================================

func main() {
    defer fmt.Println("Done")                  // Se ejecuta al final de main()
    fmt.Println("Working...")
}

// Con función anónima (lambda)
func main() {
    defer func() {
        fmt.Println("Done")
    }()
    fmt.Println("Working...")
}

// Pasar un puntero al defer para leer el valor modificado al final
func main() {
    var d = int64(0)
    defer func(d *int64) {
        fmt.Printf("& %v Unix Sec\n", *d)
    }(&d)
    fmt.Print("Done ")
    d = time.Now().Unix()
}


// ==========================================
//              PANIC Y RECOVER              
// ==========================================

defer func() {
    if r := recover(); r != nil {
        fmt.Println("recovered:", r)
    }
}()

panic("boom")

```


# Concurrencia

- Los canales (channels) son objetos de comunicación seguros para concurrencia utilizados entre goroutines
- Las goroutines se ejecutan sobre `GOMAXPROCS` hilos; desde Go 1.25 este valor respeta automáticamente el límite de CPU del contenedor en Linux
- `select` espera en múltiples operaciones de canal y ejecuta la primera que esté lista
- `wg.Go` (Go 1.25+) añade y ejecuta una tarea en el `WaitGroup` directamente (aunque `Add` y `Done` siguen funcionando)

```go

// ==========================================
//           GOROUTINES Y CANALES            
// ==========================================

func main() {
    ch := make(chan string)                    // Crear un canal

    // Iniciar rutinas concurrentes
    go push("Moe", ch)
    go push("Larry", ch)
    go push("Curly", ch)

    // Leer 3 resultados (el orden de llegada no está garantizado)
    fmt.Println(<-ch, <-ch, <-ch)
}

func push(name string, ch chan string) {
    msg := "Hey, " + name
    ch <- msg                                  // Enviar valor al canal
}


// ==========================================
//        CANALES CON BUFFER Y CIERRE        
// ==========================================

// Canal con buffer (limita cuántos mensajes almacena sin bloquear)
ch := make(chan int, 2)
ch <- 1
ch <- 2
ch <- 3                                        // Error fatal: deadlock! (buffer lleno)

// Cerrar e iterar sobre un canal
ch <- 1
ch <- 2
close(ch)

for i := range ch {
    // Recibe valores hasta que el canal se cierre
}

v, ok := <-ch                                  // ok es false si el canal está cerrado


// ==========================================
//                  SELECT                   
// ==========================================

select {
case msg := <-ch:
    fmt.Println(msg)
case <-time.After(time.Second):
    fmt.Println("timeout")
}


// ==========================================
//            WAITGROUP Y MUTEX              
// ==========================================

// Sincronizar múltiples goroutines con WaitGroup
import "sync"

func main() {
    var wg sync.WaitGroup

    for _, item := range items {
        wg.Go(func() {
            doOperation(item)
        })
    }
    wg.Wait()                                  // Espera a que todas terminen
}

// Proteger estado compartido con Mutex
var mu sync.Mutex
var count int

func inc() {
    mu.Lock()
    defer mu.Unlock()
    count++
}

```


# Paquetes e importaciones

- Todo archivo de código debe comenzar con la declaración `package`
- Los nombres (funciones, tipos, variables) que empiezan con letra **mayúscula** se exportan (son públicos); con minúscula son privados del paquete
- Usar el alias `_` importa un paquete únicamente por sus efectos secundarios (como ejecutar su función `init()`)

```go

// ==========================================
//          DECLARACION E IMPORTACION        
// ==========================================

package hello

// Importación individual
import "fmt"
import "math/rand"

// Importación agrupada (recomendado)
import (
    "fmt"                                      // Permite usar fmt.Println
    "math/rand"                                // Permite usar rand.Intn
)


// ==========================================
//           ALIAS Y EXPORTACION             
// ==========================================

import r "math/rand"                           // Importar con alias
import _ "embed"                               // Importar solo por efectos secundarios

r.Intn(10)

// Función exportada (pública fuera del paquete)
func Hello() {
    // Empieza con mayúscula
}

```