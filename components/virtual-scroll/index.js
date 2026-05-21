export const Data = () => {
    return {
        cantidad: 100000,
        usuarios: [],            // Contendrá los elementos completos en memoria
        usuariosVisibles: [],    // Subconjunto renderizado en el DOM (~30 elementos)
        listaStyle: {            // Estilos del <ul> absoluto
            position: 'absolute',
            width: '100%',
            top: '0',
            left: '0',
            transform: 'translateY(0px)',
            margin: '0',
            padding: '0',
            listStyle: 'none'
        },
        heightStyle: {           // Estilos del contenedor fantasma de la altura total
            height: '0px',
            position: 'relative'
        },
        rowHeight: 21,
        viewportHeight: 300,
        buffer: 5
    };
}

export const Methods = {
    generarDatosDePrueba() {
        let usuarios = [];
        const estados = ['Activo', 'Inactivo', 'Suspendido', 'Pendiente'];
        const roles = ['Admin', 'Usuario', 'Invitado', 'Auditor'];

        for (let i = 0; i < this.cantidad; i++) {
            usuarios.push({
                id: i + 1,
                nombre: `Usuario_Prueba_${i + 1}`,
                estado: estados[Math.floor(Math.random() * estados.length)],
                rol: roles[Math.floor(Math.random() * roles.length)],
                hash: Math.random().toString(36).substring(2, 12)
            });
        }
        this.usuarios = usuarios;

        // 1. Establecemos la altura ficticia total: (35px por fila) * cantidad de elementos
        //const rowHeight = 21;
        this.heightStyle.height = `${this.rowHeight * this.cantidad}px`;

        // 2. Inicializamos el render con la posición de scroll en 0
        this.actualizarFiltroScroll(0);
        return true;
    },

    actualizarFiltroScroll(scrollTop) {
        //const rowHeight = 21;        // Altura en píxeles de cada fila <li>
        //const viewportHeight = 300;  // Altura del visor visible
        //const buffer = 5;            // Elementos extra para amortiguar el scroll

        // Número de elementos que caben a la vista
        const visibleCount = Math.ceil(this.viewportHeight / this.rowHeight);

        // Índice del elemento superior en base a la posición del scroll
        const rawStartIndex = Math.floor(scrollTop / this.rowHeight);

        // Ajustamos el índice inicial restándole el buffer (asegurando que no sea menor a 0)
        const startIndex = Math.max(0, rawStartIndex - this.buffer);

        // Índice final estimado
        const endIndex = Math.min(this.usuarios.length, startIndex + visibleCount + (this.buffer * 2));

        // Rebanamos (slice) el array masivo para obtener solo lo que pintamos en pantalla
        this.usuariosVisibles = this.usuarios.slice(startIndex, endIndex);

        // Desplazamos el contenedor <ul> con translateY para acompañar la vista del scroll
        //const offsetY = startIndex * rowHeight;
        const offsetY = startIndex * this.rowHeight;
        this.listaStyle.transform = `translateY(${offsetY}px)`;
    },

    onViewportScroll(args, event) {
        // Obtenemos los píxeles desplazados verticalmente desde el evento de scroll
        const scrollTop = event.target.scrollTop;
        this.actualizarFiltroScroll(scrollTop);
    }
}