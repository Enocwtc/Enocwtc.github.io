export class DobleParseoArrebatoCremoso {
    compileLoopTemplate(templateNodes) {
        let operations = [];
        const traverse = (currentNodes) => {
            Array.from(currentNodes).forEach((child) => {
                if (child.nodeType === Node.TEXT_NODE) {
                    let originalText = child.nodeValue;
                    let matches = this.getTextBetweenTwoThings(originalText);
                    if (matches) {
                        operations.push({
                            isText: true,
                            matches: matches.map(m => ({ fullMatch: m, body: m.replace(/\{\{\s*(.*?)\s*\}\}/, '$1') })),
                            originalText: originalText
                        });
                    } else {
                        operations.push(null);
                    }
                } else if (child.nodeType === Node.ELEMENT_NODE) {
                    let hasLoop = false;
                    let hasReactiveAttr = false;
                    if (child.attributes) {
                        Array.from(child.attributes).forEach(attr => {
                            if (attr.name === 'loop') hasLoop = true;
                            if (this.getTextBetweenTwoThings(attr.value) || attr.name.startsWith('on') || ['if', 'show', 'class', 'style', 'module', 'checked', 'selected'].includes(attr.name)) {
                                hasReactiveAttr = true;
                            }
                        });
                    }

                    if (hasReactiveAttr || hasLoop) {
                        operations.push({
                            isText: false,
                            hasLoop: hasLoop,
                            hasReactiveAttr: hasReactiveAttr
                        });
                    } else {
                        operations.push(null);
                    }

                    if (!hasLoop && child.hasChildNodes()) {
                        traverse(child.childNodes);
                    }
                }
            });
        };
        traverse(templateNodes);
        return operations;
    }

    instantiateLoopTemplate(clonedNodes, objVariables, operations) {
        let opIndex = 0;
        const traverse = (currentNodes) => {
            Array.from(currentNodes).forEach((child) => {
                let op = operations[opIndex++];

                if (op) {
                    if (op.isText) {
                        let text = op.originalText;
                        op.matches.forEach(m => {
                            let val = this.typeExprecionObject(objVariables, m.body);
                            text = text.replace(m.fullMatch, (val !== undefined && val !== null) ? val : `\{\{${m.body}\}\}`);
                        });
                        child.nodeValue = text;
                        // Avoid registering text nodes since __isInsideLoop is true anyway
                    } else {
                        if (op.hasReactiveAttr) {
                            // Call original safe logic for elements with reactive attributes!
                            this.getNodeAttributes(child, objVariables);
                        }
                    }
                }

                if (child.nodeType === Node.ELEMENT_NODE && (!op || !op.hasLoop) && child.hasChildNodes()) {
                    traverse(child.childNodes);
                }
            });
        };
        traverse(clonedNodes);
    }

    constructor(xmlContent, componentName, thisComponent) {
        this.xmlContent = xmlContent;
        this.componentName = componentName;
        this.thisComponent = thisComponent;


    }
    parserXMLNode() {
        //Creamos un nodo HTML con el valor de this.xmlContent
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(this.xmlContent, "text/html");
        //Creamos un template : 
        let template = document.createElement(this.componentName);
        template.innerHTML = htmlDoc.body.innerHTML;
        // Convertimos el template en un string (todo el fragmento de DOM) y lo devolvemos
        return this.recursiveNode(template);
    }
    getParsedData(input, objectValue = null) {
        //Esta exprecion regular busca solo lo que se encuentra entre las llaves {{}}
        const matches = this.getTextBetweenTwoThings(input);

        if (matches) {
            matches.forEach(match => {
                //Le sacamos las llaves y los espacios
                const value = match.replace(/\{\{\s*(.*?)\s*\}\}/, '$1');
                //console.log(value, 'VALUE');
                //Detectamos si tienen [] y () y lo separamos en dos grupso.
                //Ejemplo si tiene user.name.email es un grupo 
                // Evaluamos el tipo de estructura usando expresiones regulares
                let v = this.typeExprecionObject(objectValue, value);
                if (v === undefined || v === null) {
                    input = `{{${value}}}`
                } else {
                    input = input.replace(match, v);
                }
            });
        }
        return input;
    }
    getTextBetweenTwoThings(Value) {
        const regex = /\{\{\s*(.*?)\s*\}\}/g;
        const matches = Value.match(regex);
        if (matches) {
            return matches;
        } else {
            return false;
        }
    }
    typeExprecionObject(objectValue, value) {

        if (!/[\[\(]/.test(value)) {
            //tipo = "Variable Simple";
            //Reemplazamos el valor original por el valor obtenido
            return this.recursivePropertiesObject(objectValue, value);
        } else if (/^[\w\.\$]+\(.*\)$/.test(value)) {
            //tipo = "Función Simple";
            return this.recursiveFunction(objectValue, value);
        } else if (/^[\w\.\$]+\[.*\]$/.test(value)) {
            //tipo = "Array Simple";
            return this.recursiveArray(objectValue, value);
        } else if (/^[\w\.\$]+\[.*\]\.[\w\.\$]+$/.test(value)) {
            //tipo = "Array con Propiedades";
            return this.recursiveArrayWithProperties(objectValue, value);
        } else if (/^[\w\.\$]+\(.*\)\.[\w\.\$]+$/.test(value)) {
            //tipo = "Función con Propiedades";
            return this.recursiveFunctionWithProperties(objectValue, value);
        } else {
            // Fallback a la lógica original
            if (!/\(/.test(value) && value.endsWith(']')) {
                return this.recursiveArray(objectValue, value);
            } else if (!/\[/.test(value) && value.endsWith(')')) {
                return this.recursiveFunction(objectValue, value);
            } else if (/.*\[.*\]\./.test(value)) {
                return this.recursiveArrayWithProperties(objectValue, value);
            } else if (/.*\(.*\)\./.test(value)) {
                return this.recursiveFunctionWithProperties(objectValue, value);
            }
        }
    }
    recursiveFunctionWithProperties(objectValue, value) {
        const match = value.match(/^([^\(]+)((?:\([^\)]+\))+)\.(.+)$/);
        if (match) {
            const functionName = match[1];
            const argsString = match[2];
            const properties = match[3];
            let functionValue = this.recursiveFunction(objectValue, functionName + argsString);
            if (functionValue !== undefined) {
                return this.typeExprecionObject(functionValue, properties);
            }
        }
        return undefined;
    }
    recursiveArrayWithProperties(objectValue, value) {
        const match = value.match(/^([^\[]+)((?:\[[^\]]+\])+)\.(.+)$/);
        if (match) {
            const arrayName = match[1];
            const indicesString = match[2];
            const properties = match[3];



            let arrayValue = this.recursiveArray(objectValue, arrayName + indicesString);

            if (arrayValue !== undefined) {
                return this.typeExprecionObject(arrayValue, properties);
            }

        }
        return undefined;
    }
    recursiveFunction(objectValue, value, extractFunction = false) {
        if (!value.includes('(')) {
            if (extractFunction) {
                return {
                    fun: this.recursivePropertiesObject(objectValue, value),
                    args: '',
                    name: value
                };
            }
            return this.recursivePropertiesObject(objectValue, value);
        }
        const firstParenIndex = value.indexOf('(');
        const lastParenIndex = value.lastIndexOf(')');
        const functionName = value.substring(0, firstParenIndex);
        const args = value.substring(firstParenIndex + 1, lastParenIndex);
        //Si extractFunction es true, no devuelve el valor de la funcion, sino la funcion en si misma
        if (extractFunction) {
            let reArgs = undefined;
            if (args !== '') {
                reArgs = this.recursivePropertiesObject(objectValue, args);

                if (reArgs === undefined) {
                    reArgs = this.typeExprecionObject(this.thisComponent, args);

                    const idxRegex = /\[([^\]]+)\]/g;
                    let m = idxRegex.exec(args);
                    if (m) {
                        const v = objectValue[m[1]];
                        const nameArgs = args.split('[')[0];
                        if (this.thisComponent[nameArgs]) {
                            reArgs = this.thisComponent[nameArgs][v];
                        }
                    }
                }
            }
            return {
                fun: this.recursivePropertiesObject(objectValue, functionName),
                args: (args.includes('"') || args.includes("'") || args === '') ? args : reArgs,
                name: functionName
            }
        }
        //Si args tiene comillas es un string
        if (args.includes('"') || args.includes("'") && args !== '' && args != undefined) {
            const fun = this.recursivePropertiesObject(objectValue, functionName)
            if (fun !== undefined) {
                return fun(args);
            }
        } else {
            const fun = this.recursivePropertiesObject(objectValue, functionName)
            if (fun !== undefined) {
                if (args.includes(',')) {
                    let evaluatedArgs = args.split(',').map(a => this.typeExprecionObject(objectValue, a.trim()));
                    return fun(...evaluatedArgs);
                } else {
                    return fun(this.typeExprecionObject(objectValue, args));
                }
            }
        }

    }
    recursiveArray(objectValue, value) {
        const arrayName = value.split('[')[0];

        // Extraemos cada uno de los índices (soporta array multidimensional como [1][index])
        const indices = [];
        const idxRegex = /\[([^\]]+)\]/g;
        let m;
        while ((m = idxRegex.exec(value)) !== null) {
            indices.push(m[1]); // guardamos lo que está adentro del corchete
        }
        let arrayValue = this.recursivePropertiesObject(objectValue, arrayName);
        //Si no tiene indices
        if (indices.length === 0) {
            return arrayValue;
        }
        //Si tiene indices
        else {
            for (let i = 0; i < indices.length; i++) {
                if (arrayValue === undefined || arrayValue === null) return undefined;
                //si indices[i] es un numero
                if (indices[i] == Number(indices[i])) {
                    arrayValue = arrayValue[indices[i]];
                } else {
                    let key = this.typeExprecionObject(objectValue, indices[i]);
                    if (arrayValue[key] === undefined) {
                        return '[undefined]';
                    } else {
                        arrayValue = arrayValue[key];
                    }
                }
            }
            return arrayValue;
        }
    }
    recursivePropertiesObject(objectValue, value) {
        if (objectValue === undefined || objectValue === null) return undefined;
        //Si el valor tiene . 
        if (value.includes('.')) {
            const splitValue = value.split('.');
            const firstValue = splitValue[0];
            const restValue = splitValue.slice(1).join('.');
            return this.recursivePropertiesObject(objectValue[firstValue], restValue);
        }
        return objectValue[value];
    }
    getNodeAttributes(nodo, objectValue = this.thisComponent) {
        //Si mo tiene atribbutos no hace nada
        const attr = Array.from(nodo.attributes);
        let elementReactive = {
            id: 'id del html',
            type: 'attribute',
            name: 'nombre del atributo',
        }
        attr.forEach(attribute => {
            if (attribute.name == 'checked' || attribute.name == 'selected' || attribute.name == 'required') {
                const attrType = attribute.name; // 'checked' o 'selected'

                let valueToComponent = undefined;
                //Esta exprecion regular busca solo lo que se encuentra entre las llaves {{}}
                let maches = this.getTextBetweenTwoThings(attribute.value);
                if (maches) {
                    maches.forEach(match => {
                        let bodyCondition = match.replace(/\{\{\s*(.*?)\s*\}\}/, '$1');

                        const regexOperadores = /&&|\|\|/g;
                        let operadores = bodyCondition.match(regexOperadores) || [];

                        const regexSeparador = /\s*(?:&&|\|\|)\s*/;
                        let evaluadores = bodyCondition.split(regexSeparador);

                        let eveluadoresResult = [];
                        if (evaluadores.length > 0) {
                            for (let i = 0; i < evaluadores.length; i++) {
                                valueToComponent = this.evaluateCondition(evaluadores[i], objectValue);
                                //Guardamos el valor de la condicion

                                eveluadoresResult.push(valueToComponent);

                            }
                            let evaluadorTotal = this.getCombineEvaluadorOperadorTotalResult(eveluadoresResult, operadores);
                            let anchorId = nodo.id;
                            if (!objectValue.__isInsideLoop && (!anchorId || anchorId === '')) {
                                anchorId = 'no-id-' + Math.random().toString(36).substr(2, 9);
                                nodo.id = anchorId;
                            }

                            // Forzamos el estado a nivel de propiedad en tiempo real y como valor por defecto
                            if (attrType === 'checked') {
                                nodo.checked = !!evaluadorTotal;
                                nodo.defaultChecked = !!evaluadorTotal;
                                setTimeout(() => {
                                    nodo.checked = !!evaluadorTotal;
                                }, 10);
                            } else if (attrType === 'selected') {
                                nodo.selected = !!evaluadorTotal;
                                nodo.defaultSelected = !!evaluadorTotal;
                                setTimeout(() => {
                                    nodo.selected = !!evaluadorTotal;
                                }, 10);
                            }

                            if (evaluadorTotal) {
                                nodo.setAttribute(attribute.name, attrType);
                            } else {
                                nodo.removeAttribute(attribute.name);
                            }

                            //Agregamos el elemento reactive
                            if (!objectValue.__isInsideLoop) {
                                this.setReactive(anchorId, attrType, attribute.name, nodo, bodyCondition);
                            }
                        }



                    });
                }


            } else if (attribute.name == 'module') {
                let val = attribute.value;
                let valueToComponent = undefined;
                //Esta exprecion regular busca solo lo que se encuentra entre las llaves {{}}
                let maches = this.getTextBetweenTwoThings(val);
                if (maches) {
                    maches.forEach(match => {
                        let bodyModule = match.replace(/\{\{\s*(.*?)\s*\}\}/, '$1');
                        valueToComponent = this.typeExprecionObject(objectValue, bodyModule);
                        if (valueToComponent !== undefined) {
                            //Aplicamos una funcion que vincula un evento 
                            this.moduleValue(nodo, valueToComponent, bodyModule, objectValue);
                        }
                    });
                }
            } else if (attribute.name == 'if') {
                let nodoCopy = nodo.cloneNode(true);
                nodoCopy.removeAttribute('if');

                let val = attribute.value;
                let valueToComponent = undefined;
                //Esta exprecion regular busca solo lo que se encuentra entre las llaves {{}}
                let maches = this.getTextBetweenTwoThings(val);
                if (maches) {
                    maches.forEach(match => {

                        let bodyIf = match.replace(/\{\{\s*(.*?)\s*\}\}/, '$1');

                        // ==========================================
                        // 1. EXTRAER LOS OPERADORES (&& o ||)
                        // ==========================================
                        // La expresión busca literalmente el símbolo && o el símbolo ||. 
                        // La "g" al final significa "global" (busca todos, no solo el primero).
                        // Escapamos los "||" con "\" porque en Regex el "|" significa "OR".
                        const regexOperadores = /&&|\|\|/g;
                        // match() devuelve un array con todas las coincidencias. 
                        // Ponemos el || [] al final por si no hay operadores, para que no devuelva null y rompa el código.
                        let operadores = bodyIf.match(regexOperadores) || [];
                        // Resultado: ['&&', '&&', '&&']

                        // ==========================================
                        // 2. EXTRAER LAS EXPRESIONES
                        // ==========================================
                        // En lugar de "matchear" lo que QUEREMOS, es más fácil "cortar" el string 
                        // usando lo que NO QUEREMOS (los operadores). 
                        // \s* significa "cualquier cantidad de espacios en blanco" (para limpiar los bordes).
                        // (?: ... ) es un grupo de no captura, le dice a split que corte por ahí, pero que no incluya el && en el resultado.
                        const regexSeparador = /\s*(?:&&|\|\|)\s*/;
                        let evaluadores = bodyIf.split(regexSeparador);
                        // Resultado: [
                        //   "form[v].type !== 'textarea'", 
                        //   "form[v].type !== 'checkbox'", 
                        //   "form[v].type !== 'radio'", 
                        //   "form[v].type !== 'select'"
                        // ]
                        let eveluadoresResult = [];
                        if (evaluadores.length > 0) {

                            for (let i = 0; i < evaluadores.length; i++) {
                                valueToComponent = this.evaluateCondition(evaluadores[i], objectValue);
                                //Guardamos el valor de la condicion

                                eveluadoresResult.push(valueToComponent);

                            }
                            let evaluadorTotal = this.getCombineEvaluadorOperadorTotalResult(eveluadoresResult, operadores);

                            //Le asignamos un id al ancla
                            let anchorId = nodo.id;
                            if (!objectValue.__isInsideLoop && (!anchorId || anchorId === '')) {
                                anchorId = 'no-id-' + Math.random().toString(36).substr(2, 9);
                                nodo.id = anchorId;
                            }
                            const anchor = document.createElement('if-render-node');
                            anchor.style.display = 'none'; // Aseguramos que no ocupe espacio visual
                            if (anchorId) anchor.id = anchorId;
                            if (nodo.__myVanillaKey !== undefined) anchor.__myVanillaKey = nodo.__myVanillaKey;
                            anchor.dataset.ifAnchor = evaluadorTotal ? 'true' : 'false';

                            if (nodo.parentNode && (nodo.dataset.anchor === undefined || nodo.dataset.anchor === 'true')) {
                                nodo.parentNode.insertBefore(anchor, nodo);
                                //Agregamos el elemento reactive
                                if (!objectValue.__isInsideLoop) {
                                    this.setReactive(anchorId, 'if', attribute.name, nodo, bodyIf);
                                }
                            }
                            // Conservamos un registro en el ancla sobre si el nodo visible está activo
                            if (!evaluadorTotal) {
                                anchor.dataset.rendered = 'false';
                                nodo.remove();
                            } else {
                                anchor.dataset.rendered = 'true';
                                //Eliminamos el atributo if del nodo
                                nodo.removeAttribute('if');
                            }
                        }
                    });
                }
            } else if (attribute.name == 'show') {
                let val = attribute.value;
                let valueToComponent = undefined;
                //Esta exprecion regular busca solo lo que se encuentra entre las llaves {{}}
                let maches = this.getTextBetweenTwoThings(val);
                if (maches) {
                    maches.forEach(match => {
                        let bodyShow = match.replace(/\{\{\s*(.*?)\s*\}\}/, '$1');
                        valueToComponent = this.evaluateCondition(bodyShow, objectValue);
                        //Su el valor es false borra el nodo
                        if (typeof valueToComponent === 'boolean') {
                            nodo.style.display = valueToComponent ? 'block' : 'none';
                            //Agregamos el elemento reactive
                            if (!objectValue.__isInsideLoop) {
                                nodo.id = (nodo.id !== undefined && nodo.id !== null && nodo.id !== '') ? nodo.id : 'no-id-' + Math.random().toString(36).substr(2, 9);
                                this.setReactive(nodo.id, 'show', attribute.name, undefined, bodyShow);
                            }
                        }
                    });
                }
            } else if (attribute.name == 'style') {
                let val = attribute.value;

                let valueToComponent = undefined;
                //Esta exprecion regular busca solo lo que se encuentra entre las llaves {{}}
                let maches = this.getTextBetweenTwoThings(val);
                if (maches) {
                    maches.forEach(match => {
                        let bodyStyle = match.replace(/\{\{\s*(.*?)\s*\}\}/, '$1');
                        valueToComponent = this.typeExprecionObject(objectValue, bodyStyle);
                        if (valueToComponent !== undefined && typeof valueToComponent === 'object') {
                            //Recoremos el objeto y asignamos cada propiedad a un estilo
                            attribute.value = this.formatCss(valueToComponent);
                            //Agregamos el elemento reactive
                            if (!objectValue.__isInsideLoop) {
                                nodo.id = (nodo.id !== undefined && nodo.id !== null && nodo.id !== '') ? nodo.id : 'no-id-' + Math.random().toString(36).substr(2, 9);
                                this.setReactive(nodo.id, 'style', attribute.name, undefined, bodyStyle);
                            }

                        } else {
                            attribute.value = 'No es un objeto JSON';
                        }
                    });
                }
            } else if (attribute.name == 'class') {
                let val = attribute.value;
                let valueToComponent = undefined;
                //Esta exprecion regular busca solo lo que se encuentra entre las llaves {{}}
                let maches = this.getTextBetweenTwoThings(val);
                if (maches) {
                    maches.forEach(match => {
                        let bodyClass = match.replace(/\{\{\s*(.*?)\s*\}\}/, '$1');
                        valueToComponent = this.typeExprecionObject(objectValue, bodyClass);
                        if (valueToComponent !== undefined) {
                            attribute.value = valueToComponent;

                            //Agregamos el elemento reactive
                            if (!objectValue.__isInsideLoop) {
                                nodo.id = (nodo.id !== undefined && nodo.id !== null && nodo.id !== '') ? nodo.id : 'no-id-' + Math.random().toString(36).substr(2, 9);
                                this.setReactive(nodo.id, 'class', attribute.name, undefined, bodyClass);
                            }
                        }
                    });
                }
            } else if (attribute.name == 'loop') {
                // Copieamos el nodo
                let nodoCopy = nodo.cloneNode(true);
                //Borramos el atributo loop
                nodo.removeAttribute('loop');
                let val = attribute.value;
                let valueToComponent = undefined;
                //Esta exprecion regular busca solo lo que se encuentra entre las llaves {{}}
                let maches = this.getTextBetweenTwoThings(val);
                if (maches) {
                    maches.forEach(match => {
                        let bodyFor = match.replace(/\{\{\s*(.*?)\s*\}\}/, '$1');

                        // Expresión regular que divide la declaración usando "in" u "of"
                        // match[1] será el lado izquierdo y match[2] el objeto/array a iterar
                        const forRegex = /^\s*(.+?)\s+(?:in|of)\s+(.+)\s*$/;
                        const forMatch = bodyFor.match(forRegex);

                        if (forMatch) {
                            let leftPart = forMatch[1].trim();  // Ej: "item", "(value, key)", "{ id, nombre }"
                            let iterable = forMatch[2].trim(); // Ej: "items", "miObjeto", "5"

                            // Extraemos las variables limpiando los paréntesis, llaves y separando por comas
                            let variables = leftPart.replace(/[\(\)\{\}]/g, '').split(',').map(v => v.trim());

                            // Determinamos la sintaxis que se usó a la izquierda
                            let loopSyntaxType = "Básico (1 variable)";
                            if (leftPart.startsWith('{') && leftPart.endsWith('}')) {
                                loopSyntaxType = "Desestructuración";
                            } else if (leftPart.startsWith('(') && leftPart.endsWith(')')) {
                                loopSyntaxType = "Tupla (múltiples variables)";
                            }

                            let iterableValue = this.typeExprecionObject(objectValue, iterable);

                            // 1. Guardamos la "plantilla" de hijos originales en un Array
                            // (Si no hacemos Array.from, la lista se vacía al hacer innerHTML = '')
                            let templateNodes = Array.from(nodo.childNodes);

                            // Guardamos un extracto de la clave única
                            let keyAttr = nodoCopy.getAttribute('key');

                            // 2. Vaciamos el contenedor actual
                            nodo.innerHTML = '';

                            // NUEVO: Fase de Compilación Segura
                            let blueprint = this.compileLoopTemplate(templateNodes);
                            let fragment = document.createDocumentFragment();

                            // 3. Iteramos por cada elemento
                            if (iterableValue && iterableValue.length !== undefined) {
                                for (let i = 0; i < iterableValue.length; i++) {
                                    // Usamos Object.create para heredar el contexto global del componente
                                    let objVariables = Object.create(objectValue);
                                    objVariables.__isInsideLoop = true;
                                    objVariables[variables[0]] = iterableValue[i];
                                    if (variables[1]) objVariables[variables[1]] = i;

                                    // Evaluación directa de Key para Reconciliación 
                                    let keyValue = i; // Por defecto el Key es el Indice
                                    if (keyAttr) {
                                        let machesKey = this.getTextBetweenTwoThings(keyAttr);
                                        if (machesKey) {
                                            let bodyKey = machesKey[0].replace(/\{\{\s*(.*?)\s*\}\}/, '$1');
                                            keyValue = this.typeExprecionObject(objVariables, bodyKey);
                                        } else {
                                            keyValue = keyAttr;
                                        }
                                    }

                                    // 4. Clonamos la plantilla fresca para ESTA iteración
                                    let iterNodes = templateNodes.map(child => child.cloneNode(true));

                                    // 5. Inyectamos los nodos al Fragment para evitar Reflows masivos
                                    // Ademas aseguramos que tengan parentNode
                                    iterNodes.forEach(childNode => {
                                        childNode.__myVanillaKey = keyValue;
                                        childNode.__myVanillaBlockSize = templateNodes.length;
                                        fragment.appendChild(childNode);
                                    });

                                    // 6. Instanciamos con el ejecutor hibrido
                                    this.instantiateLoopTemplate(iterNodes, objVariables, blueprint);
                                }
                            }
                            nodo.appendChild(fragment);
                            //Agregamos el elemento reactive
                            if (!objectValue.__isInsideLoop) {
                                nodo.id = (nodo.id !== undefined && nodo.id !== null && nodo.id !== '') ? nodo.id : 'no-id-' + Math.random().toString(36).substr(2, 9);
                                this.setReactive(nodo.id, 'loop', attribute.name, nodoCopy, iterable);
                            }
                        }
                    })
                }
            } else if (attribute.name.startsWith('on')) {
                this.extractAndBindEvent(nodo, attribute, objectValue, attribute.name.substring(2));
            } else {
                //Para el resto de los atributos ya que no tienen logica remplazamos lo valores. 
                let val = attribute.value;
                let valueAttribute = undefined;
                //Esta exprecion regular busca solo lo que se encuentra entre las llaves {{}}
                let maches = this.getTextBetweenTwoThings(val);
                if (maches) {
                    maches.forEach(match => {
                        let bodyAttribute = match.replace(/\{\{\s*(.*?)\s*\}\}/, '$1');
                        //Evaluamos el valor del atributo
                        valueAttribute = this.typeExprecionObject(objectValue, bodyAttribute);
                        if (valueAttribute !== undefined) {
                            //Remplazamos el valor del atributo
                            nodo.setAttribute(attribute.name, valueAttribute);
                            //Agregamos el elemento reactive
                            if (!objectValue.__isInsideLoop) {
                                nodo.id = (nodo.id !== undefined && nodo.id !== null && nodo.id !== '') ? nodo.id : 'no-id-' + Math.random().toString(36).substr(2, 9);
                                this.setReactive(nodo.id, 'attribute', attribute.name, undefined, bodyAttribute);
                            }
                        }
                    });
                }
            }
        });
    }
    getCombineEvaluadorOperadorTotalResult(evaluadoresEvaluados, operadores) {
        let expresionString = ``;
        if (evaluadoresEvaluados.length > 0 && operadores.length > 0 && evaluadoresEvaluados.length === operadores.length + 1) {
            for (let i = 0; i < evaluadoresEvaluados.length; i++) {
                expresionString += `${evaluadoresEvaluados[i]} ${operadores[i] || ''} `;
            }
            // expresionString ahora vale: "true && false && true "
        }
        else if (evaluadoresEvaluados.length === 1) {
            expresionString = String(evaluadoresEvaluados[0]);
            // expresionString ahora vale: "true"
        }
        return new Function('return ' + expresionString)();
    }
    setReactive(idElement, type, attributeName, template, expression, nodeReference = null) {
        //Es para guardar los elementos que son reactivos.
        let elementReactive = {
            id: idElement,
            type: type,
            name: attributeName,
            template: template,
            node: nodeReference
        };

        let keys = this.extractVariablesFromExpression(expression);
        keys.forEach(key => {
            if (!this.thisComponent.listElementsReactive[key]) this.thisComponent.listElementsReactive[key] = [];

            if (elementReactive.id) {
                const existingIdx = this.thisComponent.listElementsReactive[key].findIndex(r => r.id === elementReactive.id);
                if (existingIdx === -1) this.thisComponent.listElementsReactive[key].push(elementReactive);
                else this.thisComponent.listElementsReactive[key][existingIdx] = elementReactive;
            } else if (elementReactive.node) {
                const existingIdx = this.thisComponent.listElementsReactive[key].findIndex(r => r.node === elementReactive.node);
                if (existingIdx === -1) this.thisComponent.listElementsReactive[key].push(elementReactive);
                else this.thisComponent.listElementsReactive[key][existingIdx] = elementReactive;
            }
        });
    }
    extractAndBindEvent(nodo, attribute, objectValue, typeEvent) {
        //Valor del atributo
        let val = attribute.value;
        let valueToComponent = undefined;
        //Esta exprecion regular busca solo lo que se encuentra entre las llaves {{}}
        let maches = this.getTextBetweenTwoThings(val);
        if (maches) {
            maches.forEach(match => {
                let bodyFunction = match.replace(/\{\{\s*(.*?)\s*\}\}/, '$1');
                //Extraemos el parceo de la funcion
                valueToComponent = this.recursiveFunction(objectValue, bodyFunction, true);
                if (valueToComponent !== undefined) {
                    //Removemos el atributo
                    nodo.removeAttribute(attribute.name);

                    // Asignación directa y autogestionada (Evita memory leaks ya que el DOM GC se encarga si se borra)
                    nodo.addEventListener(typeEvent, (e) => {
                        if (typeof this.thisComponent[valueToComponent.name] === 'function') {
                            this.thisComponent[valueToComponent.name](valueToComponent.args, e);
                        }
                    });
                }
            });
        }
    }
    recursiveNode(nodo, objVariables = this.thisComponent) {
        if (nodo.hasChildNodes()) {
            this.bucleNode(nodo.childNodes, objVariables);
            return nodo; // Ahora devuelve el Nodo Crudo con los Eventos intactos
        } else {
            return nodo; // Ahora devuelve el Nodo Crudo con los Eventos intactos
        }
    }
    bucleNode(nodo, objVariables) {
        Array.from(nodo).forEach(child => {
            if (child.nodeType === Node.TEXT_NODE) {
                let originalText = child.nodeValue;
                let matches = this.getTextBetweenTwoThings(originalText);

                child.nodeValue = this.getParsedData(originalText, objVariables);

                if (matches && matches.length > 0) {
                    matches.forEach(match => {
                        let bodyText = match.replace(/\{\{\s*(.*?)\s*\}\}/, '$1');
                        if (!objVariables.__isInsideLoop) {
                            this.setReactive(null, 'text', 'nodeValue', originalText, bodyText, child);
                        }
                    });
                }
            } else {
                if (child.attributes != undefined && child.attributes.length !== undefined) {
                    this.getNodeAttributes(child, objVariables);

                }
                if (child.parentNode && child.hasChildNodes()) {
                    this.bucleNode(child.childNodes, objVariables);
                }
            }
        });
    }
    formatCss(objSon) {
        let css = '';
        Object.keys(objSon).forEach(key => {
            //Si key tiene mayuscula lo separamos, lo ponemos en minuscula y agregamos un guion antes.
            let keyFormat = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
            css += `${keyFormat}: ${objSon[key]}; `;
        });
        return css;
    }

    evaluateCondition(expression, context) {
        expression = expression.trim();

        // 1. Manejar negación simple (ej: !objeto, !isLogged)
        if (expression.startsWith('!')) {
            let innerValue = expression.substring(1).trim();
            return !this.typeExprecionObject(context, innerValue);
        }

        // 2. Manejar comparaciones (==, !=, ===, !==, >, <, >=, <=)
        const operatorRegex = /(.+?)\s*(===|!==|==|!=|>=|<=|>|<)\s*(.+)/;
        const match = expression.match(operatorRegex);

        if (match) {
            let leftRaw = match[1].trim();
            let operator = match[2];
            let rightRaw = match[3].trim();

            let leftValue = this.parseLiteralOrVariable(leftRaw, context);
            let rightValue = this.parseLiteralOrVariable(rightRaw, context);

            switch (operator) {
                case '==': return leftValue == rightValue;
                case '!=': return leftValue != rightValue;
                case '===': return leftValue === rightValue;
                case '!==': return leftValue !== rightValue;
                case '>': return leftValue > rightValue;
                case '<': return leftValue < rightValue;
                case '>=': return leftValue >= rightValue;
                case '<=': return leftValue <= rightValue;
            }
        }
        // 3. Si no hay operadores, evaluar como siempre (ej. if="objeto")
        return this.typeExprecionObject(context, expression);
    }

    parseLiteralOrVariable(value, context) {
        if (value === 'true') return true;
        if (value === 'false') return false;
        if (value === 'null') return null;
        if (value === 'undefined') return undefined;
        if (!isNaN(value) && value !== '') return Number(value); // Es un número
        if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
            return value.slice(1, -1); // Es un string literal
        }
        return this.typeExprecionObject(context, value); // Es una variable del componente
    }

    extractVariablesFromExpression(expression) {
        expression = expression.trim();
        let vars = [];

        if (expression.startsWith('!')) {
            let innerValue = expression.substring(1).trim();
            vars.push(innerValue.split('.')[0]);
        } else {
            const operatorRegex = /(.+?)\s*(===|!==|==|!=|>=|<=|>|<)\s*(.+)/;
            const match = expression.match(operatorRegex);

            if (match) {
                let left = match[1].trim();
                let right = match[3].trim();

                if (!this.isLiteral(left)) vars.push(left.split('.')[0]);
                if (!this.isLiteral(right)) vars.push(right.split('.')[0]);
            } else {
                if (expression.includes('(') && expression.includes(')')) {
                    let argsRaw = expression.substring(expression.indexOf('(') + 1, expression.lastIndexOf(')'));
                    let args = argsRaw.split(',').map(a => a.trim());
                    args.forEach(arg => {
                        if (arg !== '' && !this.isLiteral(arg)) {
                            vars.push(arg.split('.')[0]);
                        }
                    });
                } else {
                    vars.push(expression.split('.')[0]);
                }
            }
        }
        return vars;
    }

    isLiteral(value) {
        return value === 'true' || value === 'false' || value === 'null' || value === 'undefined' ||
            (!isNaN(value) && value !== '') ||
            (value.startsWith("'") && value.endsWith("'")) ||
            (value.startsWith('"') && value.endsWith('"'));
    }
    moduleValue(nodo, value, bodyPath, objectValue) {
        //Si nodo es un input o textarea
        if (nodo.tagName == 'INPUT' || nodo.tagName == 'TEXTAREA' || nodo.tagName == 'SELECT') {
            const isCheckbox = nodo.type === 'checkbox';
            const isRadio = nodo.type === 'radio';

            // 1. Asignar el valor inicial a la vista
            if (isCheckbox) {
                nodo.checked = Array.isArray(value) ? value.includes(nodo.value) : !!value;
            } else if (isRadio) {
                nodo.checked = value === nodo.value;
            } else {
                nodo.value = value !== undefined ? value : '';
            }

            // 2. Escuchar cuando el usuario escriba o modifique el input
            if (nodo.addEventListener) {
                const eventType = (isCheckbox || isRadio) ? 'change' : 'input';
                nodo.addEventListener(eventType, (e) => {


                    let newValue;

                    newValue = e.target.value;
                    //SI es un checkbox, y su valor Array
                    //El atributo vaue es un array. todos lista chechbox genera un array.
                    if (nodo.type === 'checkbox') {
                        //El attribute value es un array, crea una nueva lista
                        const valueListCheckInputs = new Array(value)
                        if (Array.isArray(value)) {
                            //Si el checkbox ya esta marcado, se lo desmarca, si no se lo marca.
                            valueListCheckInputs[0].includes(e.target.value) ? valueListCheckInputs[0].splice(value.indexOf(e.target.value), 1) : valueListCheckInputs[0].push(e.target.value);
                            newValue = valueListCheckInputs[0];
                        }
                    }
                    console.log(e.target.value, 'e.target.value');



                    try {
                        // 3. Crear una función dinámica que inyecte el nuevo valor.
                        // La instrucción "with(context)" permite que el string interprete
                        // variables como "form" o "v" buscando dentro de tu objectValue.
                        let setPathValue = new Function('context', 'val', `
                            with(context) {
                                ${bodyPath} = val;
                            }
                        `);
                        // 4. Ejecutar la función y sobreescribir el objeto origen
                        setPathValue(objectValue, newValue);
                    } catch (error) {
                        console.error("Error al actualizar la ruta origen del módulo:", error);
                    }
                });
            }
            return value;
        }
    }
}