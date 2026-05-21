export class GargantaProfunda {
    //Es una clase en la que vamos a crear un proxy para interceptar las llamadas a los metodos
    constructor(objData, thisComponent) {
        return this.estadoReactivo(objData, thisComponent);
    }
    //Este seria el guarda espaldas que va a interceptar las llamadas a los metodos
    estadoReactivo(objData, thisComponent, objFather = null) {
        const guardaEspaldas = {
            get: (target, property) => {
                const v = target[property];
                // Mantener el objFather original (raíz) para que las actualizaciones anidadas sigan referenciando la clave base
                const rootFather = objFather !== null ? objFather : property;
                return (typeof v === 'object' && v !== null) ? this.estadoReactivo(v, thisComponent, rootFather) : v;
            },
            set: (target, property, value) => {
                const valorViejo = target[property];

                // 1. Averiguamos si es una propiedad nueva o si estamos modificando una existente
                const isNewProperty = !Object.hasOwn(target, property);
                // 2. Guardamos el dato en el objeto real
                target[property] = value;

                // 3. 🛡️ FILTRO ANTI-DOBLE DISPARO
                // Solo actualizamos la pantalla SI el valor realmente cambió
                if (valorViejo !== value) {
                    // Si el objetivo es un Array y lo que cambió fue el 'length', lo ignoramos
                    // porque la pantalla ya se actualizó cuando se añadió el índice numérico.
                    if (Array.isArray(target) && property === 'length') {
                        return true; // Salimos en silencio
                    }
                    if (isNewProperty) {
                        // Si existe objFather (es una propiedad anidada) la usamos, 
                        // si no, usamos property (es una propiedad en la raíz)
                        const reactiveKey = objFather !== null ? objFather : property;
                        this.updateElement(reactiveKey, thisComponent, property, value);
                    } else {
                        // Si existe objFather (es una propiedad anidada) la usamos, 
                        // si no, usamos property (es una propiedad en la raíz)
                        const reactiveKey = objFather !== null ? objFather : property;
                        this.updateElement(reactiveKey, thisComponent, property, value);
                    }

                    // 👉 AQUÍ ACTUALIZAS TU DOM 
                }

                return true; // ✅ Indicar que la asignación fue exitosa
            }
        }
        return new Proxy(objData, guardaEspaldas);
    }
    updateElement(reactiveKey, thisComponent, property, value) {
        // En vez de procesarlo individualmente, recorremos TODOS los elementos en el Array de Dependencias Reactivas
        if (Object.hasOwn(thisComponent.listElementsReactive, reactiveKey)) {
            const reactives = thisComponent.listElementsReactive[reactiveKey];
            reactives.forEach(reactive => {
                const id = reactive.id;
                const type = reactive.type;
                const name = reactive.name;
                const template = reactive.template;

                //Seleccionamos el elemento
                let element;
                if (type === 'text') {
                    element = reactive.node;
                } else {
                    element = thisComponent.root.getElementById(id);
                }

                if (element) {
                    //Seleccionamos el tipo de reactividad
                    if (type === 'text') {
                        import("../Parser/DobleParseoArrebatoCremoso.js").then(parser => {
                            const parserNode = new parser.DobleParseoArrebatoCremoso('', thisComponent.componentName, thisComponent);
                            element.nodeValue = parserNode.getParsedData(template, thisComponent);
                        });
                    } else if (type === 'style') {
                        element.style[property] = value;
                    } else if (type === 'show') {
                        element.style.display = value ? 'block' : 'none';
                    } else if (type === 'class') {
                        // Asignación directa: Tolera strings vacíos ('') y clases múltiples espaciadas ('box box-green') sin crashear el navegador
                        element.className = value || '';
                    } else if (type === 'if') {
                        const isRendered = element.dataset.rendered === 'true';
                        if (value) {
                            if (!isRendered) {
                                const newNode = template.cloneNode(true);
                                import("../Parser/DobleParseoArrebatoCremoso.js").then(parser => {
                                    const parserNode = new parser.DobleParseoArrebatoCremoso('', thisComponent.componentName, thisComponent);
                                    parserNode.getNodeAttributes(newNode);
                                    parserNode.recursiveNode(newNode);
                                    element.parentNode.insertBefore(newNode, element.nextSibling);
                                    element.dataset.rendered = 'true';
                                });
                            }
                        } else {
                            if (isRendered) {
                                if (element.nextElementSibling) {
                                    element.nextElementSibling.remove();
                                }
                                element.dataset.rendered = 'false';
                            }
                        }
                    } else if (type === 'loop') {
                        import("../Parser/DobleParseoArrebatoCremoso.js").then(parser => {
                            const parserNode = new parser.DobleParseoArrebatoCremoso('', thisComponent.componentName, thisComponent);
                            const virtualNode = template.cloneNode(true);
                            virtualNode.id = element.id;  // Mantiene vivo el anclaje de ID

                            parserNode.getNodeAttributes(virtualNode);

                            // DOM Diffing Reconciliator Algorithm
                            let liveNodes = Array.from(element.childNodes);
                            let virtualNodes = Array.from(virtualNode.childNodes);

                            // 1. Mapeamos el DOM vivo buscando nuestra Llave Inyectada
                            let liveMap = new Map();
                            liveNodes.forEach(node => {
                                if (node.__myVanillaKey !== undefined) {
                                    if (!liveMap.has(node.__myVanillaKey)) liveMap.set(node.__myVanillaKey, []);
                                    liveMap.get(node.__myVanillaKey).push(node);
                                }
                            });

                            let lastInsertedNode = null;
                            let processedKeys = new Set();

                            // 2. Fuego Cruzado (Reconciliation)
                            virtualNodes.forEach(vNode => {
                                let key = vNode.__myVanillaKey;
                                processedKeys.add(key);

                                if (liveMap.has(key) && liveMap.get(key).length > 0) {
                                    // La entidad DOM existe, la desencolamos para comparar
                                    let lNode = liveMap.get(key).shift();

                                    // Performance Deep Diffing: Comprobamos criptográficamente si su contenido cambió
                                    if (!lNode.isEqualNode(vNode)) {
                                        // Parcheamos el DOM de forma granular para no perder el foco ni destruir el contenedor original
                                        this.patchDOM(lNode, vNode);
                                    }

                                    // Aseguramos que conserve su posición física en el Index del DOM
                                    if (lastInsertedNode) {
                                        if (lastInsertedNode.nextSibling !== lNode) {
                                            element.insertBefore(lNode, lastInsertedNode.nextSibling);
                                        }
                                    } else if (element.firstChild !== lNode) {
                                        element.insertBefore(lNode, element.firstChild);
                                    }
                                    lastInsertedNode = lNode;
                                } else {
                                    // Nuevo elemento detectado en el Array (es un .push())
                                    if (lastInsertedNode) {
                                        element.insertBefore(vNode, lastInsertedNode.nextSibling);
                                    } else {
                                        element.insertBefore(vNode, element.firstChild);
                                    }
                                    lastInsertedNode = vNode;
                                }
                            });

                            // 3. Poda Sistemática de items que ya no están en el array
                            liveNodes.forEach(node => {
                                if (node.__myVanillaKey !== undefined && !processedKeys.has(node.__myVanillaKey)) {
                                    node.remove();
                                }
                            });
                        }).catch(err => {
                            console.error("Error cargando el parser en reactividad for:", err);
                        });
                    }
                }
            });
        }
    }
    /**
     * DOM Diffing Granular (Patching Recursivo)
     * 
     * Este método compara un nodo real en vivo (liveNode) contra un nodo virtual recién generado (virtualNode).
     * En lugar de destruir y recrear elementos enteros (lo cual causa pérdida de foco en inputs, reseteo de cursores
     * y pérdida de Event Listeners originales), este algoritmo muta quirúrgicamente solo las partes que han cambiado:
     * 
     * 1. Actualiza nodos de texto solo si el contenido difiere.
     * 2. Sincroniza, agrega o elimina atributos de los elementos.
     * 3. Mantiene en sincronía propiedades especiales de formularios (value, checked, selected).
     * 4. Desciende recursivamente a los hijos para parchear todo el subárbol sin romper el flujo del DOM.
     * 
     * Es una de las piezas centrales para el rendimiento del framework, asegurando reactividad limpia y eficiente.
     * 
     * @param {Node} liveNode - El nodo físico que actualmente está visible en el navegador.
     * @param {Node} virtualNode - El nodo virtual generado en memoria con los estados actualizados.
     */
    patchDOM(liveNode, virtualNode) {
        if (!liveNode || !virtualNode) return;

        if (liveNode.nodeType === Node.TEXT_NODE && virtualNode.nodeType === Node.TEXT_NODE) {
            if (liveNode.nodeValue !== virtualNode.nodeValue) {
                liveNode.nodeValue = virtualNode.nodeValue;
            }
            return;
        }

        if (liveNode.nodeType === Node.ELEMENT_NODE && virtualNode.nodeType === Node.ELEMENT_NODE) {
            const vAttrs = virtualNode.attributes;
            const lAttrs = liveNode.attributes;

            for (let i = 0; i < vAttrs.length; i++) {
                const attr = vAttrs[i];
                if (liveNode.getAttribute(attr.name) !== attr.value) {
                    liveNode.setAttribute(attr.name, attr.value);
                }
            }

            for (let i = lAttrs.length - 1; i >= 0; i--) {
                const attr = lAttrs[i];
                if (!virtualNode.hasAttribute(attr.name)) {
                    liveNode.removeAttribute(attr.name);
                }
            }

            if (liveNode.tagName === 'INPUT' || liveNode.tagName === 'TEXTAREA' || liveNode.tagName === 'SELECT') {
                if (liveNode.value !== virtualNode.value) liveNode.value = virtualNode.value;
                if (liveNode.checked !== virtualNode.checked) liveNode.checked = virtualNode.checked;
                if (liveNode.tagName === 'SELECT' && liveNode.selected !== virtualNode.selected) liveNode.selected = virtualNode.selected;
            }

            let lChildren = Array.from(liveNode.childNodes);
            let vChildren = Array.from(virtualNode.childNodes);
            let maxLen = Math.max(lChildren.length, vChildren.length);

            for (let i = 0; i < maxLen; i++) {
                if (vChildren[i] && !lChildren[i]) {
                    liveNode.appendChild(vChildren[i]);
                } else if (!vChildren[i] && lChildren[i]) {
                    liveNode.removeChild(lChildren[i]);
                } else if (vChildren[i] && lChildren[i]) {
                    if (lChildren[i].nodeType !== vChildren[i].nodeType || lChildren[i].tagName !== vChildren[i].tagName) {
                        liveNode.replaceChild(vChildren[i], lChildren[i]);
                    } else {
                        this.patchDOM(lChildren[i], vChildren[i]);
                    }
                }
            }
        }
    }
}