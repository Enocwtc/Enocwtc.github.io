export default async function defineComponent(componentName) {
    const localPrefix = window.AppConfig ? window.AppConfig.prefix : 'app-';
    const customTag = `${localPrefix}${componentName}`;

    if (customElements.get(customTag)) return;

    let keyProps = [];
    let lowerKeyProps = [];
    let keyMap = {};
    let preloadedModule = null;
    try {
        preloadedModule = await import(`../../components/${componentName}/index.js`);
        if (preloadedModule.Props) {
            keyProps = Object.keys(preloadedModule.Props);
            keyProps.forEach(k => {
                const lower = k.toLowerCase();
                lowerKeyProps.push(lower);
                keyMap[lower] = k;
            });
        }
    } catch (e) {
        // Se ignora el fallo aquí
    }

    class DynamicComponent extends HTMLElement {
        #listMethods = null;
        #gp = null;
        #Props = null;
        constructor() {
            super();
            this.#gp = import("./Proxy/GargantaProfunda.js");
            // Prevención global de CLS para todos los futuros componentes
            this.style.display = 'block';
            this.style.width = '100%';
            this.style.minHeight = '100px'; // Reserva un espacio mínimo genérico y no un 0x0

            this.root = this.attachShadow({ mode: 'closed' });
            this.componentName = componentName;
            //Obtenemos una lista de los nombres de las propiedades cargadas en el index.js de cada componente.
            //Obtenemos una lista de los nombres de los metodos cargados en el index.js de cada componente.
            //Obtenemos una lista en la cual los atributos que son cargados del index.js que son asociado a
            //un nodo del xml que cargamos por separado.
            this.listElementsReactive = new Object();
        }
        static get observedAttributes() {
            return lowerKeyProps;
        }
        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue === newValue) return;
            const originalName = keyMap[name];
            // Si el componente ya cargó su XML (es decir, no es la carga inicial), 
            // re-renderizamos la vista para que el Parser inyecte el nuevo valor del Prop
            if (this.xmlContent) {
                this.render();
            }
        }
        // Es una funcion nativa del HTMLElement en la cual se ejecuta cuando el componente es insertado en el DOM
        async connectedCallback() {
            this.root.innerHTML = `<p style="color: var(--text-muted); text-align: center; font-family: sans-serif; margin-top: 2rem;">Cargando interfaz...</p>`;

            await this.loadData();
            await this.loadResources();
            await this.render();

            if (this._onMounted) this._onMounted.call(this);
        }

        // Es una funcion nativa del HTMLElement que se ejecuta cuando el componente es destruido/removido
        disconnectedCallback() {
            if (this._onUnmounted) this._onUnmounted.call(this);
        }
        //Funcion que carga el JavaScript del componente
        async loadData() {
            try {
                const module = preloadedModule || await import(`../../components/${this.componentName}/index.js`);
                if (module.Data) {
                    const listData = Object.keys(module.Data());
                    //libreria para el manejo de porxy js
                    this.#gp = await import("./Proxy/GargantaProfunda.js");
                    let stateProxy = new this.#gp.GargantaProfunda(module.Data(), this);

                    // En lugar de Object.assign, definimos getters y setters para que 
                    // las asignaciones de propiedades simples pasen a través del proxy.
                    for (const key of listData) {
                        Object.defineProperty(this, key, {
                            get: () => stateProxy[key],
                            set: (val) => { stateProxy[key] = val; },
                            configurable: true,
                            enumerable: true
                        });
                    }
                }
                if (module.Methods) {
                    this.#listMethods = Object.keys(module.Methods);
                    for (const key of this.#listMethods) {
                        this[key] = module.Methods[key].bind(this);
                    }
                }
                if (module.Props) {

                    for (const k in keyProps) {
                        //Si module.Props existe
                        const att = keyProps[k];
                        if (module.Props[att] !== undefined) {
                            Object.defineProperty(this, att, {
                                get: () => this.getAttribute(att),
                                set: (val) => {
                                    this.setAttribute(att, val);
                                },
                                configurable: true,
                                enumerable: true
                            });

                        }
                    }
                }

                // --- HOOKS DE CICLO DE VIDA ---
                if (module.created) this._onCreated = module.created;
                if (module.mounted) this._onMounted = module.mounted;
                if (module.unmounted) this._onUnmounted = module.unmounted;

                // El componente ya fue creado en memoria con Data/Methods integrados
                if (this._onCreated) this._onCreated.call(this);

            } catch (error) {
                throw new Error("No se pudieron cargar los recursos del componente: " + error);
            }
        }
        //Funcion que carga el CSS y el XML del componente
        async loadResources() {
            try {
                const [xmlRes, cssRes] = await Promise.all([
                    fetch(`./components/${this.componentName}/app.xml`),
                    fetch(`./components/${this.componentName}/style.css`)
                ]);

                if (!xmlRes.ok || !cssRes.ok) {
                    throw new Error("No se pudieron cargar los recursos del componente.");
                }

                this.xmlContent = await xmlRes.text();
                this.cssContent = await cssRes.text();
            } catch (error) {
                console.error(`[${this.componentName}] Error:`, error);
                this.xmlContent = `<p style="color: var(--error-color); text-align: center;">Error al cargar.</p>`;
                this.cssContent = '';
            }
        }
        async render() {
            const parser = await import("./Parser/DobleParseoArrebatoCremoso.js");
            const parserNode = new parser.DobleParseoArrebatoCremoso(this.xmlContent, this.componentName, this);
            const htmlNode = parserNode.parserXMLNode(); // Ya no es texto, es Elemento DOM nativo
            this.root.innerHTML = `
                <style>
                    ${this.cssContent}
                </style>
            `;
            // Mudamos el Nodo cargado con los DataSets y Eventos directamente a pantalla
            this.root.appendChild(htmlNode);
            scanAndLoad(this.root);
        }
    }
    if (!customElements.get(customTag)) {
        customElements.define(customTag, DynamicComponent);
    }
}
let isObserverAttached = false;
//Funcion que escanea el DOM y carga los componentes
export function scanAndLoad(context = document, querySelector = '*') {
    // Si el primer argumento es un string, asumimos que es el querySelector y el contexto es document
    if (typeof context === 'string') {
        querySelector = context;
        context = document;
    }

    const prefix = window.AppConfig ? window.AppConfig.prefix : 'app-';
    const elements = context.querySelectorAll(querySelector);
    for (const el of elements) {
        const tagName = el.tagName.toLowerCase();
        if (tagName.startsWith(prefix)) {
            const componentName = tagName.replace(prefix, '');
            defineComponent(componentName);
        }
    }
    //Funcion que observa los cambios en el DOM y carga los componentes
    if (!isObserverAttached) {
        isObserverAttached = true;
        const observer = new MutationObserver((mutations) => {
            let shouldScan = false;
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    shouldScan = true;
                    break;
                }
            }
            if (shouldScan) scanAndLoad(document, querySelector);
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
}
