# Reglas del Sistema de Componentes

Para mantener una arquitectura limpia y modular basada en clases (OOP) en Vanilla JS, todos los componentes deben seguir esta convención estricta:

1. **Directorio Propio:** Cada componente estará contenido en una carpeta dentro de `components/`. El nombre de esta carpeta será el nombre del componente (por ejemplo: `components/login/`).
2. **Único Archivo de Ejecución (`index.js`):** Cada componente tendrá **solo un archivo JavaScript** llamado `index.js` ubicado dentro de su carpeta. Este archivo contendrá la clase ES6 del componente y será el **único responsable de solicitar y cargar** tanto los archivos XML de estructura como el archivo `style.css`.
3. **Encapsulamiento:** Por defecto, los componentes deben ser cerrados o "scopiados" (ej. mediante Shadow DOM en modo cerrado) para aislar su comportamiento y presentación del resto de la aplicación.
4. **Estilos y Coherencia:** Los valores de los estilos CSS de los componentes son variables nativas de CSS (Custom Properties) que están definidas globalmente en `./assets/css/style.css` para mantener una coherencia en toda la aplicación.

### Ejemplo de Estructura:
```text
/components/
  └─ /navbar/
        ├─ index.js      <-- Clase ES6 Navbar (Ejecución del componente)
        ├─ app.xml       <-- Estructura UI principal
        ├─ item.xml      <-- Otras partes de la UI (múltiples .xml permitidos)
        └─ style.css     <-- Estilos aislados
```

El archivo index.js en un componente debe tener la siguiente estructura:
Los datos que se van a usar en el componente deben estar en un objeto llamado Data y las funciones en un objeto llamado Methods.
```javascript
export const Data = () => {
    return {
        sabello: "¡Variable renderizada!",
        numeracion: 42,
        index: 0,
        list: ["First item", "Item renderizado desde el array", "Third item", "Fourth item"],
        user: {
            name: "John",
            age: 30,
            email: "john@doe.com",
            admin: { key: 1 }, 
            trabajo: {
                nombre: "Developer",
                salario: "5,000",
                moneda: "USD",
                items: [
                    "Nada",
                    {
                        0: { name: "Indexado 0" },
                        1: { name: "Indexado 1" },
                        cosas: (msg) => {
                            // Esta función se declara en Data() y, según las reglas del framework, 
                            // no debería ser ejecutada por el parser.
                            return {
                                randoms: [{}, {}, { fechas: "2026-03-31" }]
                            }
                        }
                    }
                ]
            },
            trabajitus: {
                changas: [
                    "Nada",
                    [
                        "Nada",
                        "Nada",
                        {
                            cosas: {
                                randoms: [{}, {}, { fechas: "1999-12-31 desde deep path" }]
                            }
                        }
                    ]
                ]
            }
        },
        consumer: {
            trabajo: {
                status: [
                    "Nada",
                    ["Status Pendiente", "Status Completado"]
                ]
            }
        }
    }
}

export const Methods = () => {
    return {
        mssg: (text) => {
            return `✅ Mensaje procesado: ${text}`;
        },
        mssgExampleOBJ: (val) => {
            return { name: `Propiedad desde return (${val})` };
        },
        mssgFunctionWithProperties: (val) => {
            return {
                name: `Pepe name resuelto (${val})`,
                age: 99,
                email: "pepe_boss@pepe.com",
                trabajo: {
                    nombre: "Boss Master de la interpolación",
                    salario: "1,000,000",
                    moneda: "ARS"
                }
            };
        }
    }
}
```

## Sistema de Templates XML (Data Binding)

Los archivos XML representan el template estructural del componente. Se utiliza un sistema reactivo de comodines interpolados con dobles llaves `{{ ... }}` para vincular dinámicamente propiedades del componente a la vista.

Dependiendo de su formato interior, los comodines soportan varias representaciones complejas en tiempo real:

1. **Variables simples (String / Number / Booleanos)**:
   ```html
   Leemos datos tipo string {{ sabello }}
   Leemos datos tipo number {{ numeracion }}
   ```

2. **Variables de tipo Array**:
   Puedes iterar acceder a índices usando variables o fijos encerados en corchetes:
   ```html
   Detectamos una variable Array {{ list[numeracion] }}
   ```

3. **Variables de tipo Objeto (anidados)**:
   Se accede directamente al valor infinito de estas propiedades iterando con puntos (`.`):
   ```html
   Leemos datos tipo objeto {{ user.name }} {{ user.email }} {{ user.trabajo.salario }}
   ```

4. **Ejecución de Funciones / Métodos**:
   Toda funcionalidad incrustada será ejecutada pasando strings estáticos, variables u otros comodines en su interior:
   ```html
   Ejecutamos una funcion con string literal {{ mssg('Hola Perra!!!') }}
   Leemos datos tipo funcion pasando variables dinámicas {{ mssgExampleOBJ(sabello) }}
   ```

**Nota Técnica**: El contenido dentro de `{{ ... }}` se evalúa en el scope exacto de este componente. Cualquier referencia (que no posea comillas completas) se procesará bajo los métodos u objetos guardados en clase.

### 5. Parámetros y Atributos de Función: Uso de Comillas vs. Variables

Al pasar argumentos a las funciones embebidas (dentro de los `{{ ... }}`), la sintaxis del motor de parseo es muy estricta a la hora de determinar qué es un valor literal de texto y qué es una variable del componente (del objeto `Data` o un parámetro inyectado dinámicamente). 

**Reglas principales para atributos funcionales:**

- **Uso de Comillas Simples/Dobles (`'...'` o `"..."`)**: 
  El parser asume automáticamente que se trata de un valor estático literal y se lo enviará a la función como un "texto plano". 
  *Ejemplo correcto para enviar un texto crudo:*
  `{{ mostrarMensaje('Hola', 'Mundo') }}` -> Envía directamente las cadenas "Hola" y "Mundo".

- **Sin Comillas**:
  El parser asume que se trata de una ruta a las variables del contexto (`Data`) y usará `typeExprecionObject` para intentar localizar y evaluar su valor real antes de enviarlo.
  *Ejemplo correcto para enviar propiedades de nuestro Data:*
  `{{ multipleParamsVariables(user.name, user.age) }}` -> Buscará `user.name` y `user.age` dentro del scope y extraerá sus valores reales respectivos (p.ej. "John" y 30).
  
  **⚠️ Importante**: 
  - Si una variable pasada **sin** comillas no existe en la data global del componente, su evaluación resultará en un valor faltante o `undefined`. 
  - Al enviar múltiples parámetros separados por comas, el motor evaluará **independientemente** a cada uno para resolver su resultado individual y luego inyectarlos a la función requerida. Nunca rodees de grandes comillas a elementos en conjunto a menos que requieras intencionalmente ese texto intacto y estricto.

## Uso de Props

Los `Props` permiten pasar datos desde un componente padre hacia un componente hijo mediante el uso de atributos HTML.

**⚠️ Nota Importante sobre la Reactividad de los Props:**
A diferencia del estado local (`Data()`) que actualiza el DOM de forma quirúrgica (parcialmente) gracias a la reactividad de `GargantaProfunda`, **cuando se le aplique un cambio al valor de un Prop, se renderizará TODO el componente por completo**. 

El framework no actualiza "parcialmente" solo el lugar exacto donde se aplicó el Prop; hace una re-evaluación total del XML para inyectar correctamente la nueva información en todos los nodos. Ten esto muy en cuenta para el manejo del rendimiento o componentes con formularios en vivo.

## Atributos Especiales del Sistema

### 1. `data-anchor="false"` (Optimización de Condiciones `if`)

Cuando utilizas la directiva `if` en un componente, el parser de MyVanilla nativamente inyecta un nodo invisible llamado `<if-render-node>` en el DOM físico justo antes de tu elemento. Este ancla invisible sirve como marcador o "punto de retorno" para que el framework sepa exactamente en qué coordenada del HTML debe volver a inyectar el elemento si la condición cambia de `false` a `true` de manera reactiva.

Sin embargo, si estás utilizando un `if` **dentro de un ciclo `loop`**, este anclaje no es necesario. El motor de Reconciliación (Patching Recursivo) de los bucles se encarga de reevaluar y reconstruir el Virtual DOM de cada fila desde cero comparándola con el Live DOM. Al tener anclas innecesarias, podrías desordenar tu código final o causar comportamientos inesperados en las posiciones del array.

**Cómo usarlo:**
Añade `data-anchor="false"` a la etiqueta que contiene la directiva `if` para indicarle al motor que omita la creación del `<if-render-node>`.

```html
<div 
    if="{{ form[v].type == 'select' }}" 
    class="form-group"
    data-anchor="false"
>
    <!-- Contenido limpio sin anclas fantasmas -->
</div>
```

**⚠️ Advertencia Crítica de Uso:** 
Utiliza `data-anchor="false"` **únicamente** en elementos que estén contenidos dentro de una directiva `loop` (Opción B) o cuando sepas que esa condición `if` es estática y no va a cambiar dinámicamente. 

Si lo aplicas a un elemento aislado con reactividad global (Opción A) y la condición pasa a ser `false`, el nodo será destruido permanentemente de la vista y **el framework no podrá volver a re-renderizarlo nunca más** (incluso si la variable vuelve a `true`), porque habrá perdido la coordenada física (el ancla) que le indicaba dónde debía reinsertarlo.
