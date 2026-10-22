var servidorREST = "https://telemed-proyecto-p1.onrender.com";
var seccionActual = "acceso";
var idGestorActual = null;
var idRecursoActual = null;
var conexionWS = null;
var tokenJWT = null;
  
var listaModelos = [];
var listaCategorias = [];
var listaUbicaciones = [];

function cambiarSeccion(seccion){ 
    document.getElementById(seccionActual).style.display = "none";
    document.getElementById(seccion).style.display = "block";
    seccionActual = seccion;
}

function salir() {

    if (conexionWS) {
        conexionWS.close();
        conexionWS = null;
    }

    idGestorActual = null;
    tokenJWT = null;

    cambiarSeccion('acceso');
}

function getNombreModelo(id) {
    for (var i = 0; i < listaModelos.length; i++) {
        if (listaModelos[i].id == id) return listaModelos[i].nombre;
    }
    return id;
}

function getNombreCategoria(id) {
    for (var i = 0; i < listaCategorias.length; i++) {
        if (listaCategorias[i].id == id) return listaCategorias[i].nombre;
    }
    return id;
}

function getNombreUbicacion(id) {
    for (var i = 0; i < listaUbicaciones.length; i++) {
        if (listaUbicaciones[i].id == id) return listaUbicaciones[i].nombre;
    }
    return id;
}

function getNombreEstado(val) {
    if (val == 0) return "Operativo";
    if (val == 1) return "De baja o defectuoso";
    if (val == 2) return "En mantenimiento";
    return val;
}

function cargarListados() {
    rest.get(urlConToken(servidorREST + "/api/modelos"), function(estado, respuesta) {
        if (estado == 200) listaModelos = respuesta;
    });
    rest.get(urlConToken(servidorREST + "/api/categorias"), function(estado, respuesta) {
        if (estado == 200) listaCategorias = respuesta;
    });
    rest.get(urlConToken(servidorREST + "/api/ubicaciones"), function(estado, respuesta) {
        if (estado == 200) listaUbicaciones = respuesta;
    });
}

function login() {
    var gestor = {
        usuario: document.getElementById("usuario").value,
        contraseña: document.getElementById("contraseña").value
    };

    rest.post(servidorREST + "/api/gestores/login", gestor, function(estado, respuesta) {
        console.log("RESPUESTA LOGIN:", respuesta);
        if(estado == 200) {
            idGestorActual = respuesta.id;
            tokenJWT = respuesta.token;
            console.log("ID gestor:", idGestorActual);
            console.log("TOKEN JWT:", tokenJWT);
            cargarListados();
            cambiarSeccion('home');
            obtenerDatosYBienvenida(idGestorActual);
            mostrarRankingAreas();
            seccionActual = 'home';
        } else {
            alert("Credenciales incorrectas.");
        }
    });
}

function obtenerDatosYBienvenida(id) {
    rest.get(urlConToken(servidorREST + "/api/gestores/" + id), function(estado, respuesta) {
        if (estado == 200) {
            var nombreCompleto = respuesta.nombre + " " + respuesta.apellidos;
            document.getElementById("texto_bienvenida").innerHTML = "Bienvenido/a " + nombreCompleto;

            conexionWS = new WebSocket("ws://localhost:4445", "avisos");
            conexionWS.addEventListener("open", function() {
                conexionWS.send(JSON.stringify({
                    operacion: "identificar",
                    rol: "gestor",
                    id: idGestorActual,
                    nombre: nombreCompleto
                }));
            });

            conexionWS.addEventListener("message", function(msg) {
                var aviso = JSON.parse(msg.data);
                var tbody = document.getElementById("tbody_avisos");
                var fila = "<tr>"
                    + "<td style='background-color:" + aviso.color + ";'>" + new Date(aviso.fecha).toLocaleString() + "</td>"
                    + "<td style='background-color:" + aviso.color + ";'>" + aviso.origen + "</td>"
                    + "<td style='background-color:" + aviso.color + ";'>" + aviso.texto + "</td>"
                    + "</tr>";
                tbody.innerHTML += fila;
            });
        } 
    });
}

function registrarUsuario() {
    var gestor = {
        nombre: document.getElementById("reg_nombre").value,
        apellidos: document.getElementById("reg_apellidos").value,
        usuario: document.getElementById("reg_usuario").value,
        contraseña: document.getElementById("reg_contraseña").value
    }
    rest.post(servidorREST + "/api/gestores", gestor, function (estado, respuesta) {
        if (estado == 201) {
            alert("Gestor añadido correctamente a la base de datos.");
            cambiarSeccion('acceso');
            seccionActual = 'acceso';
        } else {
            alert("Error al introducir gestor en la base de datos.")
        }
    });
}

function editarDatos(){
    cambiarSeccion('editarDatos');
    seccionActual = "editarDatos";
}

function modificarUsuario() {
    var gestor = {
        id: idGestorActual,
        nombre: document.getElementById("mod_nombre").value,
        apellidos: document.getElementById("mod_apellidos").value,
        usuario: document.getElementById("mod_usuario").value,
        contraseña: document.getElementById("mod_contraseña").value
    }
    rest.put(urlConToken(servidorREST + "/api/gestores/" + idGestorActual), gestor, function(estado, respuesta) {
        if (estado == 201) {
            alert("Se han actualizado correctamente los datos.");
            cambiarSeccion('home');
        } else {
            alert("No se han actualizado los datos del gestor.")
        } 
    });
}

function mostrarRecursos() {
    var categoria = document.getElementById("home_categoria").value;
    var modelo = document.getElementById("home_modelo").value;
    var ubicacion = document.getElementById("home_ubicacion").value;
    var estadoVal = document.getElementById("home_estado").value;

    var url = servidorREST + "/api/recursos?";
    if (categoria != "0") url += "categoria=" + categoria + "&";
    if (modelo != "0") url += "modelo=" + modelo + "&";
    if (ubicacion != "0") url += "ubicacion=" + ubicacion + "&";
    if (estadoVal != "-1") url += "estado=" + estadoVal + "&";

    rest.get(urlConToken(url), function(estado, respuesta) {
        if (estado == 200) {
            var tbody = document.querySelector("#home table tbody");
            tbody.innerHTML = "";
            for (var i = 0; i < respuesta.length; i++) {
                var r = respuesta[i];
                var fila = "<tr>"
                    + "<td>" + r.numero_serie + "</td>"
                    + "<td>" + getNombreCategoria(r.categoria) + "</td>"
                    + "<td>" + getNombreModelo(r.modelo) + "</td>"
                    + "<td>" + getNombreUbicacion(r.ubicacion) + "</td>"
                    + "<td>" + getNombreEstado(r.estado) + "</td>"
                    + "<td>"
                    + "<button onclick=\"abrirRecursoConDatos(" + r.numero_serie + ")\">Abrir</button>"
                    + "<button onclick=\"borrarRecurso(" + r.numero_serie + ", this)\">X</button>"
                    + "</td>"
                    + "</tr>";
                tbody.innerHTML += fila;
            }
        } else {
            alert("No se han podido cargar los recursos.");
        }
    });
}

function añadirRecurso() {
    var recurso = {
        categoria: document.getElementById("rec_categoria").value,
        modelo: document.getElementById("rec_modelo").value,
        ubicacion: document.getElementById("rec_ubicacion").value,
        numero_serie: document.getElementById("rec_num_serie").value,
        estado: document.getElementById("rec_estado").value
    }

    rest.post(urlConToken(servidorREST + "/api/recursos"), recurso, function(estado, respuesta) {
        if(estado == 201) {
            alert("Recurso añadido correctamente a la base de datos.");

            var selectCategoria = document.getElementById("rec_categoria");
            var selectModelo = document.getElementById("rec_modelo");
            var selectUbicacion = document.getElementById("rec_ubicacion");
            var selectEstado = document.getElementById("rec_estado");

            var textoCategoria = selectCategoria.options[selectCategoria.selectedIndex].text;
            var textoModelo = selectModelo.options[selectModelo.selectedIndex].text;
            var textoUbicacion = selectUbicacion.options[selectUbicacion.selectedIndex].text;
            var textoEstado = selectEstado.options[selectEstado.selectedIndex].text;
            var numSerie = document.getElementById("rec_num_serie").value;

            if (conexionWS) {
                conexionWS.send(JSON.stringify({
                    operacion: "recursoCreado",
                    nombreCategoria: textoCategoria,
                    nombreModelo: textoModelo,
                    numeroSerie: numSerie
                }));
            }

            var tbody = document.querySelector("#home table tbody");
            var nuevaFila = "<tr>"
                + "<td>" + numSerie + "</td>"
                + "<td>" + textoCategoria + "</td>"
                + "<td>" + textoModelo + "</td>"
                + "<td>" + textoUbicacion + "</td>"
                + "<td>" + textoEstado + "</td>"
                + "<td>"
                + "<button onclick=\"abrirRecursoConDatos(" + numSerie + ")\">Abrir</button>"
                + "<button onclick=\"borrarRecurso(" + numSerie + ", this)\">X</button>"
                + "</td>"
                + "</tr>";
            tbody.innerHTML += nuevaFila;

            cambiarSeccion('home');
            seccionActual = 'home';
        } else {
            alert("El recurso no se ha podido añadir correctamente.");
        }
    });
}

function actualizarRecurso() {
    var numSerieRecurso = document.getElementById("añadir_num_serie").value;

    var recurso = {
        categoria: document.getElementById("añadir_categoria").options[document.getElementById("añadir_categoria").selectedIndex].text,
        modelo: document.getElementById("añadir_modelo").options[document.getElementById("añadir_modelo").selectedIndex].text,
        ubicacion: document.getElementById("añadir_ubicacion").options[document.getElementById("añadir_ubicacion").selectedIndex].text,
        estado: document.getElementById("añadir_estado").options[document.getElementById("añadir_estado").selectedIndex].text,
        id_modelo: document.getElementById("añadir_modelo").value,
        id_ubicacion: document.getElementById("añadir_ubicacion").value,
        id_estado: document.getElementById("añadir_estado").value
    }

    rest.put(urlConToken(servidorREST + "/api/recursos/" + numSerieRecurso), {
        modelo: recurso.id_modelo,
        ubicacion: recurso.id_ubicacion,
        estado: recurso.id_estado
    }, function(estado, respuesta) {
        if(estado == 200) {
            alert("Recurso actualizado en la base de datos.");
            var filas = document.querySelectorAll("#home table tbody tr");
            filas.forEach(function(fila) {
                if (fila.cells[0].innerText == numSerieRecurso) {
                    fila.cells[1].innerText = recurso.categoria;
                    fila.cells[2].innerText = recurso.modelo;
                    fila.cells[3].innerText = recurso.ubicacion;
                    fila.cells[4].innerText = recurso.estado;
                }
            });
            cambiarSeccion('home');
        } else {
            alert("El recurso no se ha actualizado.");
        }
    });
}

function borrarRecurso(numSerie, boton) {
    if (confirm("¿Estás seguro de que deseas eliminar el recurso con Nº Serie: " + numSerie + "?")) {
        rest.delete(urlConToken(servidorREST + "/api/recursos/" + numSerie), function(estado, respuesta) {
            if (estado == 200) {
                alert(respuesta);
                var fila = boton.parentNode.parentNode;
                fila.parentNode.removeChild(fila);
                cambiarSeccion('home');
                seccionActual = 'home';
            } else {
                alert("Error al borrar el recurso.");
            }
        });
    }
}

function abrirRecursoConDatos(numSerie) {
    rest.get(urlConToken(servidorREST + "/api/recursos/" + numSerie), function(estado, recurso) {
        if (estado == 200) {
            document.getElementById("añadir_num_serie").value = recurso.numero_serie;
            document.getElementById("añadir_modelo").value = recurso.modelo;
            document.getElementById("añadir_ubicacion").value = recurso.ubicacion;
            document.getElementById("añadir_estado").value = recurso.estado.toString();
            cargarTablaReservas(recurso.id);
            cargarTablaResenyas(recurso.id);
            cambiarSeccion('actualizarRecurso');
        } else {
            alert("Error al cargar el recurso. El servidor no lo encuentra.");
        }
    });
}

function cargarTablaReservas(idRecurso) {
    rest.get(urlConToken(servidorREST + "/api/recursos/" + idRecurso + "/reservas"), function(estado, reservas) {
        var tbody = document.getElementById("tabla_reservas_body");
        tbody.innerHTML = "";
        if (estado == 200) {
            reservas.forEach(function(r) {
                rest.get(urlConToken(servidorREST + "/api/sanitarios/" + r.sanitario), function(st, san) {
                    var nombre = (st == 200) ? (san.nombre + " " + san.apellidos) : "ID: " + r.sanitario;
                    var colorFondo;
                    if (r.fecha_fin) {
                        colorFondo = "#ffffff";
                    } else if (r.fecha_inicio) {
                        var inicio = new Date(r.fecha_inicio);
                        var ahora = new Date();
                        var horasTranscurridas = (ahora - inicio) / (1000 * 60 * 60);
                        if (horasTranscurridas > r.horas_estimadas) {
                            colorFondo = "#fecaca";
                        } else {
                            colorFondo = "#bfdbfe";
                        }
                    } else {
                        colorFondo = "#d9f99d";
                    }
                    var fila = "<tr>"
                        + "<td style='background-color:" + colorFondo + ";'>" + nombre + "</td>"
                        + "<td style='background-color:" + colorFondo + ";'>" + r.horas_estimadas + "</td>"
                        + "<td style='background-color:" + colorFondo + ";'>" + new Date(r.fecha_peticion).toLocaleDateString() + "</td>"
                        + "<td style='background-color:" + colorFondo + ";'>" + (r.fecha_inicio ? new Date(r.fecha_inicio).toLocaleDateString() : "-") + "</td>"
                        + "<td style='background-color:" + colorFondo + ";'>" + (r.fecha_fin ? new Date(r.fecha_fin).toLocaleDateString() : "-") + "</td>"
                        + "</tr>";
                    tbody.innerHTML += fila;
                });
            });
        }
    });
}

function cargarTablaResenyas(idRecurso) {
    rest.get(urlConToken(servidorREST + "/api/recursos/" + idRecurso + "/resenyas"), function(estado, resenyas) {
        var tbody = document.getElementById("tabla_resenas_body");
        tbody.innerHTML = "";
        if (estado == 200) {
            resenyas.forEach(function(r) {
                rest.get(urlConToken(servidorREST + "/api/sanitarios/" + r.sanitario), function(st, san) {
                    var nombre = (st == 200) ? (san.nombre + " " + san.apellidos) : "ID: " + r.sanitario;
                    var fila = "<tr><td>"+new Date(r.fecha).toLocaleDateString()+"</td><td>"+nombre+"</td><td>"+r.valor+"</td><td>"+r.descripcion+"</td></tr>";
                    tbody.innerHTML += fila;
                });
            });
        }
    });
}

function crearArea() {

    var area = {
        codigo: document.getElementById("area_codigo").value,
        nombre: document.getElementById("area_nombre").value,
        gestor: idGestorActual
    };

    rest.post(
        urlConToken(servidorREST + "/api/areas"),
        area,
        function(estado, respuesta) {

            if (estado == 201) {
                alert("Área creada correctamente.");
            } else {
                alert("No se ha podido crear el área.");
            }
        }
    );
}

function formatearFechaMinisterio(fecha) {

    if (fecha == null) {
        return null;
    }

    var f = new Date(fecha);

    return f.toISOString().split("T")[0];
}


function obtenerFechaHoy() {

    var hoy = new Date();

    return hoy.toISOString().split("T")[0];
}


function enviarReservasMinisterio() {

    // Primero pedimos a nuestro servidor
    // todas las reservas ya preparadas.

    rest.get(
        urlConToken(servidorREST + "/api/reservas/ministerio"),

        function(estado, reservas) {

            if (estado != 200) {

                alert(
                    "No se han podido obtener las reservas."
                );

                return;
            }


            // Creamos el array que exige el Ministerio.

            var datosMinisterio = [];


            for (var i = 0; i < reservas.length; i++) {

                var r = reservas[i];


                datosMinisterio.push({

                    nombre: r.nombre,

                    apellidos: r.apellidos,

                    categoria: r.categoria,

                    horas_estimadas: r.horas_estimadas,

                    fec_pet:
                        formatearFechaMinisterio(r.fec_pet),

                    fec_ini:
                        formatearFechaMinisterio(r.fec_ini),

                    fecha_fin:
                        formatearFechaMinisterio(r.fecha_fin)
                });
            }


            // Construimos el objeto completo.

            var envio = {

                id_area: 10,

                fecha: obtenerFechaHoy(),

                datos: datosMinisterio
            };


            console.log(
                "Datos que se enviarán al Ministerio:",
                envio
            );


            // Ahora enviamos el POST al Ministerio.

            rest.post(
                "https://undefined.ua.es/telemedicina/api/datos",

                envio,

                function(estadoMinisterio, respuestaMinisterio) {

                    if (
                        estadoMinisterio >= 200 &&
                        estadoMinisterio < 300
                    ) {

                        alert(
                            "Reservas enviadas correctamente al Ministerio."
                        );

                        console.log(
                            "Respuesta Ministerio:",
                            respuestaMinisterio
                        );

                    } else {

                        alert(
                            "Error al enviar las reservas al Ministerio."
                        );

                        console.log(
                            "Estado:",
                            estadoMinisterio
                        );

                        console.log(
                            "Respuesta:",
                            respuestaMinisterio
                        );
                    }
                }
            );
        }
    );
}

function mostrarRankingAreas() {

    rest.get(
        "https://undefined.ua.es/telemedicina/api/datos",

        function(estado, respuesta) {

            if (estado != 200) {

                console.log(
                    "Error obteniendo datos del Ministerio:",
                    estado,
                    respuesta
                );

                return;
            }


            // -------------------------------
            // NOMBRES DE LAS ÁREAS
            // -------------------------------

            var nombresAreas = {
                1: "Alergología",
                2: "Anestesiología",
                3: "Cardiología",
                4: "Cirugía General",
                5: "Dermatología",
                6: "Aparato Digestivo",
                7: "Endocrinología",
                8: "Ginecología",
                9: "Hematología",
                10: "Medicina Interna",
                11: "Neumología",
                12: "Neurología",
                13: "Oftalmología",
                14: "Oncología",
                15: "Pediatría",
                16: "Psiquiatría",
                17: "Traumatología",
                18: "Urología"
            };


            // -------------------------------
            // CONTAMOS RESERVAS POR ÁREA
            // -------------------------------

            var contadorAreas = {};


            for (var i = 0; i < respuesta.length; i++) {

                var envio = respuesta[i];

                var idArea = Number(envio.id_area);


                if (contadorAreas[idArea] == undefined) {

                    contadorAreas[idArea] = 0;
                }


                if (Array.isArray(envio.datos)) {

                    contadorAreas[idArea] +=
                        envio.datos.length;
                }
            }


            // -------------------------------
            // LO PASAMOS A UN ARRAY
            // -------------------------------

            var ranking = [];


            for (var idArea in contadorAreas) {

                ranking.push({

                    id_area: Number(idArea),

                    nombre:
                        nombresAreas[idArea] ||
                        ("Área " + idArea),

                    total:
                        contadorAreas[idArea]
                });
            }


            // -------------------------------
            // ORDENAMOS DE MAYOR A MENOR
            // -------------------------------

            ranking.sort(function(a, b) {

                return b.total - a.total;
            });


            // -------------------------------
            // MOSTRAMOS LA TABLA
            // -------------------------------

            var tbody =
                document.getElementById(
                    "tbody_ranking_areas"
                );


            tbody.innerHTML = "";


            for (var j = 0; j < ranking.length; j++) {

                var fila =
                    document.createElement("tr");


                fila.innerHTML =
                    "<td>" + (j + 1) + "</td>" +
                    "<td>" +
                        ranking[j].nombre +
                    "</td>" +
                    "<td>" +
                        ranking[j].total +
                    "</td>";


                tbody.appendChild(fila);
            }
        }
    );
}


function contarRegistrosConUnaReservaPorArea() {

    var idArea =
        Number(
            document.getElementById(
                "id_area_buscar"
            ).value
        );

    if (!idArea) {
        alert("Introduce un ID de área válido.");
        return;
    }

    rest.get(
        "https://undefined.ua.es/telemedicina/api/datos",

        function(estado, respuesta) {

            if (estado != 200) {
                alert("Error al obtener los datos.");
                return;
            }

            var contador = {};

            for (var i = 0; i < respuesta.length; i++) {

                var envio = respuesta[i];

                if (contador[idArea] == undefined) {
                    contador[idArea] = 0;
                }

                if (
                    Array.isArray(envio.datos) &&
                    envio.datos.length == 1
                ) {
                    contador[idArea]++;
                }
            }


            var nombre =
                nombres[idArea] ||
                ("Área " + idArea);

            alert(
                nombre +
                ": " +
                contador[idArea] +
                " registros con una sola reserva"
            );

        }
    );
}



function mediaHorasEstimadasArea9() {

    var suma = 0;

    var cantidad = 0;

    rest.get(
        "https://undefined.ua.es/telemedicina/api/datos",

        function(estado, respuesta) {

            if (estado != 200) {
                alert("Error al obtener los datos.");
                return;
            }

            for (
                var i = 0;
                i < respuesta.length;
                i++
            ) {

                var envio =
                    respuesta[i];

                if (
                    Number(envio.id_area)== 9
                    &&
                    Array.isArray(envio.datos)
                ) {

                    for (var j = 0;j < envio.datos.length;j++) {

                        suma +=Number(envio.datos[j].horas_estimadas)|| 0;
                        cantidad++;
                    }
                }
            }

            var media = 0;

            if (
                cantidad > 0
            ) {media =suma /cantidad;}

            alert(
                "La medida de horas estimadas de uso de las reservas del área Hematología es: "+media.toFixed(2)
            );
        }
    );
}




function urlConToken(url) {

    if (tokenJWT == null) {
        return url;
    }

    if (url.includes("?")) {
        return url + "&token=" + encodeURIComponent(tokenJWT);
    }

    return url + "?token=" + encodeURIComponent(tokenJWT);
}