import { scanAndLoad } from './LoadComponents.js';

/**
 * Motor Principal - Carga Dinámica de Componentes
 * Implementa un sistema de lazy-loading basado en Vanilla ES6 Modules.
 */
class ComponentEngine {
    constructor() {
        this.loadedComponents = new Set();
    }

    async init() {
        // 1. Inyectar datos dinámicos globales (app-id.json)
        try {
            const configRes = await fetch('./app-id.json');
            if (!configRes.ok) throw new Error("No se pudo acceder a app-id.json");
            window.AppConfig = await configRes.json();
            console.log(`[MyVanilla Engine] Inicializando: ${window.AppConfig.name} v${window.AppConfig.version} | Autor: ${window.AppConfig.author}`);
        } catch (error) {
            console.warn("[MyVanilla Engine] Archivo app-id.json ausente. Restableciendo defaults.");
            window.AppConfig = { prefix: "app-", name: "myVanilla", version: "0.0.1.0", author: "Alexander Rodriguez Enoc Mombru Ass Enocwtc" };
        }

        // 2. Establecer prefijo a escanear dinámicamente
        this.prefix = window.AppConfig.prefix || 'app-';

        // 3. Ejecución de primera carga
        scanAndLoad('*');
    }
}

// Inicializar motor en cuando el DOM esté disponible
document.addEventListener('DOMContentLoaded', () => {
    const engine = new ComponentEngine();
    engine.init();
});
