---
title: CheatSheet Python
description: CheatSheet de Python con cosas basicas.
category: Cheatsheet
date: 2026-10-30
tags: [cheatsheet, python]
---


# Empezando en python

```bash

# Iniciar una shell interactiva

$ python

# Salir de la consola interactiva

>>> exit()

# Ejecutar un script

$ python script.py

# Ejecutar script en modo interactivo

$ python -i script.py

```


# Comentarios

- Siempre añadir un `#` seguido de un espacio
- Utilizarlos para explicar el por que del codigo.

```python
# Esto es un comentario
# print("Este codigo no funciona")
print("Este si funciona")  # Los comentarios son ignorados.
```


# Tipo de datos

- Python es de tipado dinámico
- Usa `None` para representar valores faltantes u opcionales
- Usa `type()` para comprobar el tipo de un objeto
- Comprueba si es de un tipo específico con `isinstance()`
- `issubclass()` comprueba si una clase es una subclase

```python

# ==========================================
#             TIPO INVESTIGACION            
# ==========================================

type(42)                # <class 'int'>
type(3.14)              # <class 'float'>
type("Hello")           # <class 'str'>
type(True)              # <class 'bool'>
type(None)              # <class 'NoneType'>

isinstance(3.14, float)  # True
issubclass(int, object)  # True - Todo hereda de `object`


# ==========================================
#              TIPO CONVERSION              
# ==========================================

int("42")                # 42
float("3.14")            # 3.14
str(42)                  # "42"
bool(1)                  # True
list("abc")              # ["a", "b", "c"]

```


# Variables y asignación

- Las variables se crean cuando se les asigna un valor por primera vez
- Usa nombres de variables descriptivos
- Sigue la convención `snake_case` (palabras en minúsculas separadas por guiones bajos)

```python

# ==========================================
#             ASIGNACION BASICA             
# ==========================================

name = "Leo"           # String
age = 7                # Integer
height = 5.6           # Float
is_cat = True          # Boolean
flaws = None           # None type


# ==========================================
#      ASIGNACION PARALELA Y ENCADENADA     
# ==========================================

x, y = 10, 20          # Asigna varios valores
a = b = c = 0          # Dar mismo valor a varias variables


# ==========================================
#           ASIGNACION AUMENTADAS           
# ==========================================

counter += 1
numbers += [4, 5]
permissions |= write

```



# Cadenas de texto

- Se recomienda usar comillas dobles para las cadenas de texto
- Usa `"\n"` para crear un salto de línea en una cadena de texto
- Para escribir una barra invertida en una cadena de texto normal, escribe `"\\"`

```python

# ==========================================
#                CREAR CADENA               
# ==========================================

single = 'Hello'
double = "World"
multi = """Multiple
line string"""


# ==========================================
#          OPERACIONES CON CADENAS          
# ==========================================

greeting = "me" + "ow!"  # "meow!"
repeat = "Meow!" * 3     # "Meow!Meow!Meow!"
length = len("Python")   # 6


# ==========================================
#             METODOS EN CADENA             
# ==========================================

"a".upper()                     # "A"
"A".lower()                     # "a"
" a ".strip()                   # "a"
"abc".replace("bc", "ha")       # "aha"
"a b".split()                   # ["a", "b"]
"-".join(["a", "b"])            # "a-b"


# ==========================================
#      INDICE Y DESLIZAMIENTO EN CADENA     
# ==========================================

text = "Python"
text[0]      # "P" (PRIMERO)
text[-1]     # "n" (ULTIMO)
text[1:4]    # "yth" (CORTAR)
text[:3]     # "Pyt" (DESDE EL COMIENZO)
text[3:]     # "hon" (DESDE EL FINAL)
text[::2]    # "Pto" (CADA 2)
text[::-1]   # "nohtyP" (INVERSO)


# ==========================================
#             FORMATO DE CADENA             
# ==========================================

# f-strings
name = "Aubrey"
age = 2
f"Hola, {name}!"               # "Hola, Aubrey!"
f"{name} tiene {age} años"     # "Aubrey tiene 2 años"
f"Debug: {age=}"               # "Debug: age=2"

# Format method
template = "Hola, {name}! Tu tienes {age}."
template.format(name="Aubrey", age=2)    # "Hola, Aubrey! Tu tienes 2."


# ==========================================
#               CADENA EN RAW               
# ==========================================

# Cadena de texto normal con una tabulación escapada
"This is:\tCool."       # "This is:    Cool."

# Cadena de texto cruda (_raw string_) con secuencias de escape
r"This is:\tCool."      # "This is:\tCool."

```


# Números y operaciones


```python

# ==========================================
#          OPERACIONES ARITMETICAS          
# ==========================================

10 + 3    # 13
10 - 3    # 7
10 * 3    # 30
10 / 3    # 3.3333333333333335
10 // 3   # 3
10 % 3    # 1
2 ** 3    # 8


# ==========================================
#              FUNCIONES UTILES             
# ==========================================

abs(-5)              # 5
round(3.7)           # 4
round(3.14159, 2)    # 3.14
min(3, 1, 2)         # 1
max(3, 1, 2)         # 3
sum([1, 2, 3])       # 6

```


# Condicionales

- Python usa la indentación (o sangría) para los bloques de código

```python

# ==========================================
#                IF-ELIF-ELSE               
# ==========================================

if age < 13:
    category = "child"
elif age < 20:
    category = "teenager"
else:
    category = "adult"


# ==========================================
#         OPERADORES DE COMPARACION         
# ==========================================

x == y    # Igual a
x != y    # Diferente de (o no igual a)
x < y     # Menor que
x <= y    # Menor o igual que
x > y     # Mayor que
x >= y    # Mayor o igual que


# ==========================================
#             OPERADORES LOGICOS            
# ==========================================

if age >= 18 and has_car:
    print("Roadtrip!")

if is_weekend or is_holiday:
    print("No work today.")

if not is_raining:
    print("You can go outside.")

```


# Loops

- `range(5)` genera del 0 al 4
- Usa `enumerate()` para obtener el índice y el valor
- `break` sale del bucle, `continue` salta a la siguiente iteración
- Ten cuidado con `while` para no crear un bucle infinito

```python

# ==========================================
#                    FOR                    
# ==========================================

# Iterar a través de un rango
for i in range(5):      # 0, 1, 2, 3, 4
    print(i)

# Iterar a través de una colección
fruits = ["apple", "banana"]
for fruit in fruits:
    print(fruit)

# Con enumerate para obtener el índice
for i, fruit in enumerate(fruits):
    print(f"{i}: {fruit}")


# ==========================================
#                   WHILE                   
# ==========================================

while True:
    user_input = input("Enter 'quit' to exit: ")
    if user_input == "quit":
        break
    print(f"You entered: {user_input}")


# ==========================================
#               CONTROLAR LOOP              
# ==========================================

for i in range(10):
    if i == 3:
        continue  # Saltar esta iteración
    if i == 7:
        break     # Salir del bucle
    print(i)

```

# Funciones

- Define funciones con `def`
- Usa siempre `()` para llamar a una función
- Añade `return` para devolver valores
- Crea funciones anónimas con la palabra clave `lambda`

```python

# ==========================================
#             DEFINIR FUNCIONES             
# ==========================================

def greet():
    return "Hello!"

def greet_person(name):
    return f"Hello, {name}!"

def add(x, y=10):    # Parametro por defecto
    return x + y


# ==========================================
#            LLAMADA DE FUNCIONES           
# ==========================================

greet()                   # "Hello!"
greet_person("Bartosz")   # "Hello, Bartosz"
add(5, 3)                 # 8
add(7)                    # 17


# ==========================================
#              DEVOLVER VALORES             
# ==========================================

def get_min_max(numbers):
    return min(numbers), max(numbers)

minimum, maximum = get_min_max([1, 5, 3])


# ==========================================
#        FUNCIONES INTEGRADAS UTILES        
# ==========================================

callable()  # Comprueba si un objeto puede ser llamado como una función
dir()       # Lista los atributos y métodos
globals()   # Obtiene un diccionario de la tabla de símbolos global actual
hash()      # Obtiene el valor hash
id()        # Obtiene el identificador único
locals()    # Obtiene un diccionario de la tabla de símbolos local actual
repr()      # Obtiene una representación en cadena de texto para depuración (debugging)


# ==========================================
#              FUNCIONES LAMBDA             
# ==========================================

square = lambda x: x**2
result = square(5)  # 25

# Con map y filter
numbers = [1, 2, 3, 4]
squared = list(map(lambda x: x**2, numbers))
evens = list(filter(lambda x: x % 2 == 0, numbers))

```


# Clases

- Las clases son plantillas (o planos) para los objetos
- Puedes crear múltiples instancias de una misma clase
- Comúnmente se usan las clases para encapsular datos
- Dentro de una clase, proporcionas métodos para interactuar con los datos
- `.__init__()` es el método constructor
- `self` hace referencia a la instancia

```python

# ==========================================
#               DEFINIR CLASES              
# ==========================================

class Dog:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def bark(self):
        return f"{self.name} says Woof!"

# Crear instancia
my_dog = Dog("Frieda", 3)
print(my_dog.bark())  # Frieda says Woof!


# ==========================================
#       ATRIBUTOS Y METODOS DE CLASES       
# ==========================================

class Cat:
    species = "Felis catus"   # Atributo de clase

    def __init__(self, name):
        self.name = name      # Atributo de instancia

    def meow(self):
        return f"{self.name} says Meow!"

    @classmethod
    def create_kitten(cls, name):
        return cls(f"Baby {name}")


# ==========================================
#                  HERENCIA                 
# ==========================================

class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        pass

class Dog(Animal):
    def speak(self):
        return f"{self.name} barks!"

```


# Excepciones

- Cuando Python se ejecuta y encuentra un error, crea una excepción
- Usa tipos de excepción específicos cuando sea posible
- `else` se ejecuta si no ocurrió ninguna excepción
- `finally` se ejecuta siempre, incluso después de los errores

```python

# ==========================================
#                 TRY-EXCEPT                
# ==========================================

try:
    number = int(input("Enter a number: "))
    result = 10 / number
except ValueError:
    print("That's not a valid number!")
except ZeroDivisionError:
    print("Cannot divide by zero!")
else:
    print(f"Result: {result}")
finally:
    print("Calculation attempted")


# ==========================================
#            EXCEPCIONES COMUNES            
# ==========================================

ValueError         # Valor inválido (o no válido)
TypeError          # Tipo incorrecto
IndexError         # Índice de lista fuera de rango
KeyError           # Clave de diccionario no encontrada
FileNotFoundError  # El archivo no existe


# ==========================================
#             LANZAR EXCEPCIONES            
# ==========================================

def validate_age(age):
    if age < 0:
        raise ValueError("Age cannot be negative")
    return age

```


# Colecciones (Listas, diccionarios, tuplas,...)

- Una colección es cualquier estructura de datos contenedora que almacena múltiples elementos
- Si un objeto es una colección, entonces puedes iterar a través de él
- Las cadenas de texto también son colecciones
- Usa `len()` para obtener el tamaño de una colección
- Puedes comprobar si un elemento está en una colección con la palabra clave `in`
- Algunas colecciones pueden parecer similares, pero cada estructura de datos resuelve necesidades específicas

```python

# ==========================================
#                   LISTAS                  
# ==========================================

# Crear listas
empty = []
nums = [5]
mixed = [1, "two", 3.0, True]

# Métodos de listas
nums.append("x")         # Añadir al final
nums.insert(0, "y")      # Insertar en el índice 0
nums.extend(["z", 5])    # Extender con un iterable
nums.remove("x")         # Eliminar la primera "x"
last = nums.pop()        # Pop elimina y devuelve el último elemento

# Indexación y comprobaciones en listas
fruits = ["banana", "apple", "orange"]
fruits[0]                # "banana"
fruits[-1]               # "orange"
"apple" in fruits        # True
len(fruits)              # 3


# ==========================================
#                   TUPLAS                  
# ==========================================

# Crear tuplas
point = (3, 4)
single = (1,)    # ¡Fíjate en la coma!
empty = ()

# Desempaquetado básico de tuplas
point = (3, 4)
x, y = point 
x                # 3
y                # 4

# Desempaquetado extendido
first, *rest = (1, 2, 3, 4) 
first            # 1
rest             # [2, 3, 4]


# ==========================================
#                    SETS                   
# ==========================================

# Crear conjuntos (sets)
a = {1, 2, 3}
b = set([3, 4, 4, 5])

# Operaciones con conjuntos
a | b            # {1, 2, 3, 4, 5} (Unión)
a & b            # {3} (Intersección)
a - b            # {1, 2} (Diferencia)
a ^ b            # {1, 2, 4, 5} (Diferencia simétrica)


# ==========================================
#                DICCIONARIOS               
# ==========================================

# Crear diccionarios
empty = {}
pet = {"name": "Leo", "age": 42}

# Operaciones con diccionarios
pet["sound"] = "Purr!"   # Añadir clave y valor
pet["age"] = 7           # Actualizar valor
age = pet.get("age", 0)  # Obtener con valor por defecto
del pet["sound"]         # Eliminar clave
pet.pop("age")           # Eliminar y devolver el valor

# Métodos de diccionarios
pet = {"name": "Frieda", "sound": "Bark!"}
pet.keys()         # dict_keys(['name', 'sound'])
pet.values()       # dict_values(['Frieda', 'Bark!'])
pet.items()        # dict_items([('name', 'Frieda'), ('sound', 'Bark!')])

```


# Comprensiones

- Puedes pensar en las comprensiones como bucles `for` condensados
- Las comprensiones son más rápidas que los bucles equivalentes

```python

# ==========================================
#            LISTA COMPRENSIONES            
# ==========================================

# Básica
squares = [x**2 for x in range(10)]

# Con condición
evens = [x for x in range(20) if x % 2 == 0]

# Anidada
matrix = [[i*j for j in range(3)] for i in range(3)]


# ==========================================
#            OTRAS COMPRENSIONES            
# ==========================================

# Comprensión de diccionario
word_lengths = {word: len(word) for word in ["hello", "world"]}

# Comprensión de conjunto (set)
unique_lengths = {len(word) for word in ["who", "what", "why"]}

# Expresión generadora
sum_squares = sum(x**2 for x in range(1000))

```


# Entrada/Salida archivos


```python
# Leer un archivo completo
with open("file.txt", mode="r", encoding="utf-8") as file:
    content = file.read()

# Leer un archivo línea por línea
with open("file.txt", mode="r", encoding="utf-8") as file:
    for line in file:
        print(line.strip())

# Escribir un archivo
with open("output.txt", mode="w", encoding="utf-8") as file:
    file.write("Hello, World!\n")

# Añadir al final de un archivo
with open("log.txt", mode="a", encoding="utf-8") as file:
    file.write("New log entry\n")
```


# Importaciones y módulos

- Prefiere las importaciones explícitas sobre `import *`
- Usa alias para nombres de módulos largos
- Agrupa las importaciones: biblioteca estándar, bibliotecas de terceros y módulos definidos por el usuario

```python

# ==========================================
#           ESTILOS DE IMPORTACION          
# ==========================================

# Importar el módulo completo
import math
result = math.sqrt(16)

# Importar una función específica
from math import sqrt
result = sqrt(16)

# Importar con un alias
import numpy as np
array = np.array([1, 2, 3])

# Importar todo (no recomendado)
from math import *


# ==========================================
#            IMPORTE DE PAQUETES            
# ==========================================

# Importar desde un paquete
import package.module
from package import module
from package.subpackage import module

# Importar elementos específicos
from package.module import function, Class
from package.module import name as alias

```

# Entornos virtual

- Los entornos virtuales a menudo se llaman «venv»
- Usa los `venv` para aislar los paquetes de un proyecto de los paquetes de Python de todo el sistema

```python

# ==========================================
#          CREAR UN ENTORNO VIRTUAL         
# ==========================================

\$ python -m venv .venv


# ==========================================
#   ACTIVAR EL ENTORNO VIRTUAL EN WINDOWS   
# ==========================================

PS> .venv\Scripts\activate


# ==========================================
# ACTIVAR EL ENTORNO EN LINUX Y MACOS       
# ==========================================

$ source .venv/bin/activate


# ==========================================
#        DESACTIVAR EL ENTORNO VIRTUAL      
# ==========================================

(.venv) \$ deactivate

```


---

- **Ref**: https://realpython.com/cheatsheets/python