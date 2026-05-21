<div align="center">
  <img src="link_a_tu_logo.png" alt="myVanilla.js Logo" width="200">

  # myVanilla.js
  **Un motor de UI JIT en memoria, cero dependencias, que inyecta 100k nodos reactivos más rápido de lo que Chrome puede pintarlos.**
</div>

---

## ⚠️ The Problem

Modern web development suffers from abstraction overload. Current frameworks collapse under the weight of their own Virtual DOM when faced with massive interfaces. We force the browser to download megabytes of packaged JavaScript just to render a form or a list, and when we try to scale, we end up battling "Out of Memory" errors.

**myVanilla.js** is my answer to that problem. Built exclusively with Vanilla JavaScript and native technologies, with no build-time compilers (zero Webpack, zero Vite, zero Babel). What you write is what the browser executes.

## ⚡ The Architecture (How we beat the VDOM)

This framework doesn't guess or compare entire trees. It operates under two fundamental low-level principles:

1. **JIT Template Compiler (`DobleParseoArrebatoCremoso.js`):** Instead of evaluating regular expressions in each iteration, the engine compiles the HTML string *only once* in memory just before rendering, creating an exact map of operations. Then, it uses native cloning and direct surgical mutation on `child.nodeValue`, bypassing the browser's expensive HTML parser.

2. **Reconciliation and Reactivity via Proxy (`GargantaProfunda.js`):** A proxy-based deep reactivity system that intercepts state changes. It implements a recursive *Deep Diffing* algorithm that mutates only the exact attribute, value, or text that changed, without destroying the physical tag, losing focus, or performing unnecessary repaints.

*(Yes, the names of the internal modules are an inside joke, but the performance they deliver is absolutely lethal.)*

## 📊 Benchmarks: The Brute Force Test

In static stress tests (synchronous rendering injected into the real DOM without virtualization), myVanilla.js demonstrates strict linear scalability $O(n)$.

**Test: Render 100,000 reactive elements in the raw DOM.**
* **Scripting Time (JavaScript):** ~4.2 seconds.

* **Rendering Time (Chrome Blink Engine):** ~4.7 seconds.

*Conclusion:* The JIT engine processes and assembles the nodes in memory at a rate of **0.042 ms per node**. The bottleneck is no longer the JavaScript logic but the physical limit of the graphics card for rendering the pixels.

## 🚀 Native Virtual Scroll (For Production)

While the benchmark above demonstrates brute force, in production, nobody is spitting 100k nodes into the DOM.

myVanilla.js includes a native `<nಠ_ಠn-virtual-scroll>` component. It keeps the array of 100,000 data points in memory, but **only renders and recycles the 30 physical nodes** that fit in the viewport. By using `nodeValue` to mutate the data on scrolling, the framerate stays locked at 60 FPS with no memory leaks.

## 🛠️ Try it yourself to break it

Don't believe my screenshots, clone this and open Profiler on your own machine.

```bash
git clone [https://github.com/your-username/myVanilla.js.git](https://github.com/Enocwtc/myVanilla.js.git)
cd myVanilla.js
# There's no `npm install`. There's no `npm run build`. It's Vanilla.

# Just start a Live Server in the root directory or open index.html