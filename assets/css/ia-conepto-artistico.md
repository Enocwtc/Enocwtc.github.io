# Concepto Artístico de la Aplicación

## Estructura Visual y Atmósfera
El diseño de la aplicación evoca un **Modo Nocturno clásico y elegante (Dark Mode)**, priorizando la legibilidad, el confort visual y minimizando la fatiga ocular.
La atmósfera es inmersiva y moderna, enfocada en resaltar el contenido mediante superficies oscuras neutras y acentos de color vibrantes que guían la atención del usuario.

## Paleta de Colores
- **Fondos (Backgrounds):** Utiliza grises carbón extremadamente profundos y cuasi-negros (ej. `#0a0a0a`, `#121212`) en lugar de negro puro (`#000000`), siguiendo las mejores prácticas de diseño para reducir el contraste extremo.
- **Detalles y Acentos:**
  - **Acento Primario (`#bb86fc` o `#3b82f6`)**: Colores desaturados o vibrantes que pasen las pruebas de accesibilidad sobre fondos oscuros (ej. Púrpura suave o Azul eléctrico).
  - **Error / Precaución (`#cf6679`)**: Rojo suavizado para no ser estridente frente al fondo oscuro.
  - **Éxito (`#03dac6`)**: Verde azulado (Teal) o Esmeralda claro que contraste adecuadamente.
  - **Variaciones de Superficie**: Diferenciación de profundidad usando niveles de gris (`--card-bg`, `--bg-elevated`) para crear la ilusión de jerarquía lumínica (superficies más cercanas son más claras).

## Uso de Degradados (Gradients)
- Los **degradados** deben ser sumamente sutiles y utilizarse principalmente para indicar interactividad (botones, estados hover) o para separar secciones. No deben distraer de la funcionalidad principal.

## Tipografía y Reglas de Fuentes
- **Encabezados (`h1` a `h6`)**: El tamaño de cada nivel está centralizado mediante variables globales. El color principal debe ser un gris muy claro (ej. `#e0e0e0`) para evitar la fatiga visual de un blanco puro.
- **Párrafos (`<p>`)**: Usan grises medios (ej. `#a0a0a0`) para establecer una jerarquía de lectura confortable.
- **Etiquetas de Computación (`<samp>`)**: Usan una fuente monoespaciada con la variable global correspondiente al proyecto.
