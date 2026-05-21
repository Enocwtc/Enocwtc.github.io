export const Data = () => {
    return {
        cantidad: 100000,
        usuarios: []
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
                // Genera un hash aleatorio para simular datos dinámicos pesados
                hash: Math.random().toString(36).substring(2, 12)
            });
        }
        this.usuarios = usuarios;
        return true;
    },
    heightAutoScroll() {
        const heithUL = 21;
        console.log(this.cantidad)
        return `height:${heithUL * this.cantidad}px;`

    }
}