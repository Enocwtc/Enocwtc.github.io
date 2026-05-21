export let Data = () => {
    return {
        //stateManager Es para manejar el estado del componente
        stM: {
            active: false,
        },
        pepe: [
            "Hola",
            "Mundo",
            "Como",
            "Estas",
        ],
        list: [
            "File",
            "Edit",
            "Selection",
            "View",
            "Go",
            "Run",
            "Terminal",
            "Help",
        ],
    }
}
export const Methods = {
    mssg: (value) => {
        console.log(value, 'Hizo click');
    }
}