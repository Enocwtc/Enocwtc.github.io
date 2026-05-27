export let Data = () => {
    return {
        sabello: "¡Variable renderizada!",
        numeracion: 42,
        index: 0,
        list: ["First item", "Item renderizado desde el array", "Third item", "Fourth item"],
        user: {
            name: "John",
            age: 30,
            email: "john@doe.com",
            admin: { key: 1 },
            trabajo: {
                nombre: "Developer",
                salario: "5,000",
                moneda: "USD",
                items: [
                    "Nada",
                    {
                        0: { name: "Indexado 0" },
                        1: { name: "Indexado 1" },
                        cosas: (msg) => {
                            return {
                                randoms: [{}, {}, { fechas: "2026-03-31 " + msg }]
                            }
                        }
                    }
                ]
            },
            trabajitus: {
                changas: [
                    "Nada",
                    [
                        "Nada",
                        "Nada",
                        {
                            cosas: {
                                randoms: [{}, {}, { fechas: "1999-12-31 desde deep path" }]
                            }
                        }
                    ]
                ]
            }
        },
        consumer: {
            trabajo: {
                status: [
                    "Nada",
                    ["Status Pendiente", "Status Completado"]
                ]
            }
        },
        myStyles: {
            color: 'red',
            fontSize: '20px',
            fontWeight: 'bold',
            backgroundColor: 'blue'
        },
        show: true,
        testClass: 'testClass',
        style1: 'testClass',
        style2: 'testClass2'
    }
}
export const Props = {
    nombreDeObjeto: {
        type: Object,
        default: {}
    }
}
export const Created = function () {
    console.log('Componente creado');
}
export const Mounted = function () {
    console.log('Componente montado');
}
export const Unmounted = function () {
    console.log('Componente desmontado');
}

export const Methods = {
    ModifyIf: function () {
        this.show = (this.show === true) ? false : true;
    },
    sistemChangeClass: function () {
        if (this.testClass === this.style1) {
            this.testClass = this.style2;
        } else {
            this.testClass = this.style1;
            console.log(this.testClass, 'testClass');
            console.log(this.style1, 'style1');
            console.log(this.style2, 'style2');
        }
    },
    ModifyFor: function () {
        this.list.push(`Item ${this.list.length + 1}`);
        console.log(this.list, 'list');
    },
    sistemChange: function () {
        console.log(this.myStyles, 'Antes de cambiar');
        this.myStyles.color = 'green';
        this.myStyles.backgroundColor = 'yellow';

        console.log(this.myStyles, 'Despues de cambiar');
    },
    showHide: function () {
        this.show = (this.show === true) ? false : true;
    },
    mssg: (text) => {
        return `✅ Mensaje procesado: ${text}`;
    },
    mssgExampleOBJ: (val) => {
        return { name: `Propiedad desde return (${val})` };
    },
    mssgFunctionWithProperties: (val) => {
        return {
            name: `Pepe name resuelto ${val}`,
            age: 99,
            email: "pepe_boss@pepe.com",
            trabajo: {
                nombre: "Boss Master de la interpolación",
                salario: "1,000,000",
                moneda: "ARS"
            }
        };
    },
    multipleParamsString: (args) => {
        // Nuestro parser agrupa todo lo que está entre los paréntesis de la función.
        // Si hay comillas, ingresa como un único string literal, por lo que lo separamos manualmente.
        if (!args) return "Sin argumentos";
        const params = args.split(',').map(p => p.trim().replace(/['"]/g, ''));
        return `Texto formatado: ${params[0]} - ${params[1]} -> ${params[2]}`;
    },
    multipleParamsNumbers: (args) => {
        // Al recibir los múltiples parámetros como una sola cadena, extraemos los números para operarlos.
        if (!args) return "Sin argumentos";
        const params = args.split(',').map(p => Number(p.replace(/['"]/g, '').trim()));
        let total = params.reduce((a, b) => a + Number(b), 0);
        return `Total calculado de los parámetros: ${total}`;
    },
    multipleParamsVariables: (args) => {
        // Simulamos la recepción de múltiples strings que representan rutas de variables 
        if (!args) return "Sin variables detectadas";
        const params = args.split(',').map(p => p.trim().replace(/['"]/g, ''));
        return `Variables detectadas en parámetros: 1) ${params[0]} 2) ${params[1]} 3) ${params[2]}`;
    }
}
