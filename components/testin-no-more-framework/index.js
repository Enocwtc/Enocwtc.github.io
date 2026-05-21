export function Data() {
    return {
        // Test 1: Intento agresivo de ataque XSS (El DOM Quirúrgico deberá inyectarlo como texto nativo neutral)
        hackPayload: `<img src="fail" onerror="alert('CRÍTICO: Vulnerabilidad XSS Confirmada!')" /> <script>alert('XSS Script');</script>`,

        // Test 2: Grafo de Dependencias (Un solo bool controla simultáneamente varias directivas de UI en el Proxy)
        superState: false,
        activeClass: '',
        activeStyle: { backgroundColor: '#333', color: '#999', padding: '10px' },

        // Test 3: Listas Quirúrgicas vs Strings + Memory Leaks de Listeners
        people: [
            { id: 101, name: "Maria" },
            { id: 102, name: "Pedro" }
        ],
        dbIndex: 103

    }
}

export const Methods = {
    triggerState(args) {
        // Al alterar esta única variable, MyVanilla Engine iterará por nuestro nuevo Arreglo en listElementsReactive
        // y despertará de golpe a 4 nodos distintos (un show, un if, un class y un style).
        this.superState = !this.superState;
        if (this.superState) {
            this.activeClass = 'box-green';
            this.activeStyle = { backgroundColor: '#cfffc2', color: '#1a5f00', padding: '15px' };
        } else {
            this.activeClass = '';
            this.activeStyle = { backgroundColor: '#333', color: '#999', padding: '10px' };
        }
    },

    addToHeavyList(args) {
        // En MyVanilla original, hacer un push requería renderizar los strings internos arruinando los clicks (memory leaks).
        // Evaluaremos el tiempo en consola (F12) que toma inyectar los nuevos nodos crudos.
        const t0 = performance.now();

        let temp = [...this.people];
        for (let i = 0; i < 10; i++) {
            temp.push({
                id: this.dbIndex++,
                name: "Persona #" + this.dbIndex
            });
        }
        // Asignar el nuevo array despierta al GargantaProfunda loop
        this.people = temp;

        const t1 = performance.now();
        console.log(`[MyVanilla v2] Quirúrgico: Añadidos 10 nodos puros en ${(t1 - t0).toFixed(3)} ms`);
    },

    cleanList(args) {
        // El framework no se trabará gracias al Garbage Collector nativo al remover los listeners crudos
        this.people = [];
        console.log("[MyVanilla v2] Lista vaciada. Eventos nativos liberados de forma segura.");
    },

    testGCEvent(args) {
        // Este evento se asigna on the fly, sin arrays globales que saturen la memoria RAM.
        alert("¡Éxito! Evento Nativo de ID: " + args.id + ". Memory Leak y Bug de innerHTML resueltos.");
    }
}
