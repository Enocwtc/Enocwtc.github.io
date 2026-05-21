export const Data = () => {
    return {
        formTitle: "Registro de Usuario",
        user: {
            id: "usr_998877",
            name: "Enoc Softwarer",
            email: "enoc@example.com",
            age: 30,
            bio: "Entusiasta de Vanilla JS y creador de frameworks potentes sin dependencias. Me encanta el diseño moderno y las arquitecturas limpias.",
            preferences: {
                color: "#6366f1", // Un tono índigo muy elegante
                subscribe: true,
                volume: 75
            }
        },
        options: {
            countries: [
                "Argentina",
                "Colombia",
                "España",
                "México",
                "Estados Unidos"
            ]
        },
        ifinloop: false,
        form: {
            name: {
                type: "text",
                value: "",
                placeholder: "Ingresa tu nombre",
                required: true,
                error: ""
            },
            email: {
                type: "email",
                value: "enocometalero@gmail.com",
                placeholder: "ejemplo@correo.com",
                required: true,
                autocomplete: "email",
                error: ""
            },
            password: {
                type: "password",
                value: "",
                placeholder: "Tu contraseña secreta",
                required: true,
                autocomplete: "current-password",
                error: ""
            },
            age: {
                type: "number",
                value: 18,
                placeholder: "Ej: 30",
                required: true,
                error: ""
            },
            textarea: {
                type: "textarea",
                value: "",
                placeholder: "",
                required: true,
                error: ""
            },
            dob: {
                type: "date",
                value: "",
                placeholder: "",
                required: true,
                error: ""
            },
            time: {
                type: "time",
                value: "",
                placeholder: "",
            },
            meeting: {
                type: "datetime-local",
                value: "",
                placeholder: "",
            },
            bmonth: {
                type: "month",
                value: "",
                placeholder: "",
            },
            week: {
                type: "week",
                value: "",
                placeholder: "",
            },
            search: {
                type: "search",
                value: "",
                placeholder: "",
            },
            website: {
                type: "url",
                value: "",
                placeholder: "",
            },
            phone: {
                type: "tel",
                value: "",
                placeholder: "",
            },
            color: {
                type: "color",
                value: "",
                placeholder: "",
            },
            volume: {
                type: "range",
                value: "",
                placeholder: "",
            },
            gender: {
                type: "radio",
                value: "",
                placeholder: "",
                options: [
                    "male",
                    "female",
                    "other"
                ],
                checked: 'female',
            },
            country: {
                type: "select",
                value: "",
                placeholder: "",
                options: [
                    "Argentina",
                    "Colombia",
                    "España",
                    "México",
                    "Estados Unidos"
                ],
                selected: "Colombia"
            },
            services: {
                type: "checkbox",
                value: "",
                placeholder: "",
                options: [
                    'cocinero',
                    'barman',
                    'mesero',
                    'limpieza',
                    'valet'
                ],
                checked: ['barman', 'limpieza']
            }
        }
    }
}

export const Methods = {
    getKeys(object) {
        return Object.keys(object);
    },
    isCheckedCompare(
        camparadores,  //Es un array con una lista de valores que esta pre seleccionados.
        comparado  //Es un string y es el valor a comparar.
    ) {
        return camparadores.includes(comparado) ? true : false;
    },





    submitForm: (event) => {
        console.log("Formulario enviado correctamente.");
        return {
            status: "success",
            message: "¡Datos guardados con éxito!"
        };
    },
    handleImageUpload: () => {
        console.log("Procesando imagen subida...");
    }

}
