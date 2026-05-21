# Instrucciones de Estilos Globales (CSS)

Estas son las reglas estrictas para manejar los estilos CSS en el proyecto, garantizando un diseño moderno, coherente y mantenible usando **Vanilla CSS**.

## 1. Sistema de Diseño basado en Variables
- Todas las propiedades de diseño reutilizables (colores, tipografías, espaciados, bordes, sombras) **deben declararse como variables CSS** (`--var-name`) dentro de la pseudo-clase `:root` en el archivo global de estilos (`assets/css/style.css`).
- **Prohibido "hardcodear"** (escribir directamente) valores fijos de colores, tipografías o espacios en los CSS de los componentes. Siempre debe usarse `var(--nombre-variable)`.
- Esto garantiza la coherencia impuesta en todo el proyecto.

## 2. Archivos Globales vs Componentes
- **Globales (`assets/css/style.css`):** Contiene el "reset" de CSS, la definición de `:root` con las variables globales, clases utilitarias (si llegaran a existir) y los estilos de etiquetas base (`body`, `a`, `h1-h6`, etc). No contiene estilos específicos de la UI.
- **Componentes:** Los estilos propios de cada componente (`components/mi-componente/style.css`) consumen las variables globales definidas en `:root` pero **nunca** definen estilos globales que afecten fuera de su "scope" o encapsulation.

## 3. Calidad Visual y Diseño Premium
- **Layouts Modernos:** Utiliza siempre CSS Flexbox o CSS Grid para posicionar elementos.
- **Micro-interacciones:** Agrega transiciones suaves (`transition: all 0.3s ease`) en estados `:hover`, `:focus` y `:active` para botones, inputs, enlaces y tarjetas. Esto otorga una sensación premium.
- **Estética Cuidada:** Evita colores genéricos básicos (ej. un rojo #FF0000 puro). Usa paletas de colores armoniosas adaptadas al sistema de diseño, sombras sutiles (`box-shadow`) y diseños en cristal (glassmorphism) si es apropiado.
- Evita que los diseños se vean simples o anticuados.

## 4. Reset y Normalización Básica
Para asegurar la consistencia entre navegadores y dimensionado, el archivo de estilos global siempre debe ordenar un reset inicial exhaustivo (márgenes, paddings, box-sizing, etc.) de manera imperativa y teórica, sin proveer ejemplos en línea.

## 5. Responsividad y Unidades
- **Enfoque Mobile-First:** Diseña los estilos por defecto pensando en móvil, usando media queries (`@media (min-width: ...)`) para añadir complejidad visual a resoluciones mayores.
- **Unidades Relativas:** Prioriza el uso de unidades relativas como `rem` para tipografía, `em` o `%` (y `vw`/`vh` según sea necesario) en vez de `px` estáticos cuando se requiera accesibilidad y adaptabilidad.
