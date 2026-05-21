# Motor de Carga Dinámica (MyVanilla Engine)

El archivo `assets/js/main.js` actúa como el motor núcleo inteligente de la aplicación. Su objetivo central es evitar la importación manual de decenas de dependencias y hacer que la aplicación sea 100% modular mediante "Lazy Loading" (carga diferida).

## Funcionamiento del Motor
1. **Detección Automática:** Al cargar el `index.html` (y mediante observación continua del DOM usando `MutationObserver`), el motor escanea todas las etiquetas HTML buscando prefijos personalizados como `<app-...>` (ej. `<app-login>`).
2. **Cálculo de Rutas:** Si encuentra `<app-login>`, el sistema sabe por deducción que necesita cargar el componente `login`.
3. **Importación Dinámica:** Utiliza importaciones nativas de ES6 Modules (`await import(...)`) para solicitar al instante el `index.js` correspondiente que reside en `components/login/index.js`.
4. **Delegación de Responsabilidad:** Una vez cargado el `index.js`, el Motor Main se desentiende. Ahora es el componente quien, según las reglas previamente estipuladas, cargará sus propios archivos XML para el template y CSS para sus estilos aislados.

## Configuración Global (`app-id.json`)
El entorno está preparado para ser modificado dinámicamente mediante el archivo maestro `app-id.json`. **Es importante aclarar que el prefijo por defecto de todos los componentes (normalmente `app-`) viene dado desde este archivo de configuración global**. 
Al estar integrado en el motor, si alteras el `"prefix"` en el JSON (ej. a `"mi-"`), los Custom Elements pasarán a registrarse y consumirse automáticamente con esa nueva etiqueta (ej. `<mi-login>`).

## Requisitos Técnicos
- El `main.js` debe estar enlazado en el HTML con el atributo **`type="module"`** para que la resolución de importaciones relativas dinámicas de ES6 funcione estrictamente en Vanilla JS.
- Solamente se cargan por red y se ejecutan los componentes que el usuario realmente está visualizando o que se renderizan en el DOM.
