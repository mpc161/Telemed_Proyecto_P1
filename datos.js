var sanitarios = [
    {id: 1, nombre: "Ana María", apellidos: "López", usuario: "amlopez", contraseña: "amlopez1"},
    {id: 2, nombre: "Carlos", apellidos: "Ruiz", usuario: "cruiz", contraseña: "cruiz1"},
    {id: 3, nombre: "Juan Pablo", apellidos: "Gómez", usuario: "jpgomez", contraseña: "jpgomez1"}
]

var gestores = [
    {id: 1, nombre: "Laura", apellidos: "Sánchez Romero", usuario: "lsanchez", contraseña: "lsanchez1"},
    {id: 2, nombre: "Miguel Ángel", apellidos: "Torres", usuario: "matorres", contraseña: "matorres1"},
]

var ubicaciones = [
    {id: 1, nombre: "Hospital General"},
    {id: 2, nombre: "Almacén Central"},
    {id: 3, nombre: "Laboratorio de Diagnóstico"}
]

/*{
    id: null, // Identificador numérico único por cada ubicación
    nombre: "" // Nombre de la ubicación
}
    */

var categorias = [
    {id: 1, nombre: "Monitores"},
    {id: 2, nombre: "Soporte Vital"},
    {id: 3, nombre: "Movilidad"}
]

/*{
    id: null, // Identificador numérico único de cada catergoría
    nombre: "" // Nombre de la categoría
}
    */

var modelos = [
    {id: 1, nombre: "Monitor multiparamétrico Philips", categoria: 1, horas_maximas: 48},
    {id: 2, nombre: "Respirador Dräger Evita", categoria: 2, horas_maximas: 72},
    {id: 3, nombre: "Silla de ruedas estándar", categoria: 3, horas_maximas: 24}
]

/*{
    id: null,
    nombre: "", // Nombre del modelo
    categoria: "", // Identificador de la categoría a la que pertenece
    horas_maximas: null // Horas máximas que se puede reservar un dispositivo de este modelo
}
    */

var recursos = [
    {id: 1, categoria: 1, modelo: 1, ubicacion: 1, numero_serie: 100001, estado: 0},
    {id: 2, categoria: 1, modelo: 1, ubicacion: 2, numero_serie: 100002, estado: 2},
    {id: 3, categoria: 2, modelo: 2, ubicacion: 1, numero_serie: 100003, estado: 0},
    {id: 4, categoria: 2, modelo: 2, ubicacion: 3, numero_serie: 100004, estado: 1},
    {id: 5, categoria: 3, modelo: 3, ubicacion: 2, numero_serie: 100005, estado: 0},
    {id: 6, categoria: 3, modelo: 3, ubicacion: 1, numero_serie: 100006, estado: 2},
    {id: 7, categoria: 1, modelo: 1, ubicacion: 3, numero_serie: 100007, estado: 0},
    {id: 8, categoria: 2, modelo: 2, ubicacion: 2, numero_serie: 100008, estado: 0},
    {id: 9, categoria: 3, modelo: 3, ubicacion: 3, numero_serie: 100009, estado: 1},
    {id: 10, categoria: 1, modelo: 1, ubicacion: 1, numero_serie: 100010, estado: 0}
]

/*{
    id: null,
    modelo: null,
    ubicacion: "",
    numero_serie: null,
    estado: null // 0: operativo; 1: de bada o defectuoso; 2: en mantenimiento
}
    */

var reservas = [
    {id: 1, recurso: 1, sanitario: 1, horas_estimadas: 24, fecha_peticion: new Date("2026-02-01T09:30:00"), fecha_inicio: new Date("2026-02-01T10:00:00"), fecha_fin: new Date("2026-02-02T10:00:00")},
    {id: 2, recurso: 7, sanitario: 1, horas_estimadas: 12, fecha_peticion: new Date("2026-03-10T08:00:00"), fecha_inicio: new Date("2026-03-10T09:00:00"), fecha_fin: null},

    {id: 3, recurso: 3, sanitario: 2, horas_estimadas: 48, fecha_peticion: new Date("2026-02-10T07:00:00"), fecha_inicio: new Date("2026-02-10T08:00:00"), fecha_fin: new Date("2026-02-12T08:00:00")},
    {id: 4, recurso: 8, sanitario: 2, horas_estimadas: 36, fecha_peticion: new Date("2026-03-15T10:00:00"), fecha_inicio: new Date("2026-03-15T11:00:00"), fecha_fin: null},
    {id: 5, recurso: 5, sanitario: 2, horas_estimadas: 10, fecha_peticion: new Date("2026-03-20T09:00:00"), fecha_inicio: null, fecha_fin: null},

    {id: 6, recurso: 3, sanitario: 3, horas_estimadas: 12, fecha_peticion: new Date("2026-01-15T11:00:00"), fecha_inicio: new Date("2026-01-15T12:00:00"), fecha_fin: new Date("2026-01-16T12:00:00")},
    {id: 7, recurso: 10, sanitario: 3, horas_estimadas: 24, fecha_peticion: new Date("2026-02-20T14:00:00"), fecha_inicio: new Date("2026-02-20T15:00:00"), fecha_fin: new Date("2026-02-21T15:00:00")},
    {id: 8, recurso: 9, sanitario: 3, horas_estimadas: 8,  fecha_peticion: new Date("2026-03-22T08:30:00"), fecha_inicio: null, fecha_fin: null}
]

/*{
    id: null,
    recurso: null,
    sanitario: null,
    horas_estimadas: null,
    fecha_peticion: null, // DATE
    fecha_inicio: null, // DATE
    fecha_fin: null, // DATE
}
    */

var resenyas = [
    {id: 1, recurso: 1, sanitario: 1, fecha: new Date("2026-02-02T12:30:00"), valor: 5, descripcion: "Funcionó perfectamente durante toda la reserva."},
    {id: 2, recurso: 3, sanitario: 3, fecha: new Date("2026-02-04T18:00:00"), valor: 4, descripcion: "Cómoda y en buen estado, aunque algo pesada."}
] 

/*{
    id: null,
    recurso: null,
    sanitario: null,
    fecha: null, // DATE
    valor: null,
    descripcion: ""
}
    */

var estado = [
    {id: 0, estado: "Operativo"},
    {id: 1, estado: "De baja o Defectuoso"},
    {id: 2, estado: "En Mantenimiento"}
]

// Exportamos para poder usarlos en el servidor 
module.exports.sanitarios=sanitarios;
module.exports.gestores=gestores;
module.exports.ubicaciones=ubicaciones;
module.exports.categorias=categorias;
module.exports.modelos=modelos;
module.exports.recursos=recursos;
module.exports.reservas=reservas;
module.exports.resenyas=resenyas;
module.exports.estado=estado;