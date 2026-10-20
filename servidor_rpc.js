var rpc = require("./rpc.js");
var conexion = require("./conexion_mysql.js");

 
var servidor = rpc.server(3501, function() {
    console.log("Servidor iniciado...");
});

var app = servidor.createApp("gestion_pacientes");

function obtenerCategorias(callback) {

    var sql = "SELECT * FROM categorias";

    conexion.query(sql, function(err, resultado) {
        if (err) {
            console.log("Error al obtener las categorias:", err);
            return callback([]);
        }

        return callback(resultado);
    });
}


function obtenerModelos(callback) {

    var sql = "SELECT * FROM modelos";

    conexion.query(sql, function(err, resultado) {
        if (err) {
            console.log("Error al obtener los modelos:", err);
            return callback([]);
        }

        return callback(resultado);
    });
} 

function loginSanitario(usuario, contraseña, callback) {

    var sql = "SELECT * FROM sanitarios WHERE usuario = ? AND contraseña = ?";

    conexion.query(sql, [usuario, contraseña], function(err, resultado) {

        if (err) {
            console.log("Error al realizar el login del sanitario:", err);
            return callback(null);
        }

        if (resultado.length > 0) {
            return callback(resultado[0].id);
        }

        return callback(null);
    });
}


function crearSanitario(nombre, apellidos, usuario, contraseña, callback) {

    var sqlComprobar = "SELECT * FROM sanitarios WHERE usuario = ?";

    conexion.query(sqlComprobar, [usuario], function(err, resultado) {

        if (err) {
            console.log("Error comprobando el sanitario:", err);
            return callback(null);
        }

        if (resultado.length > 0) {
            return callback(null);
        }

        var sqlInsertar =
            "INSERT INTO sanitarios (nombre, apellidos, usuario, contraseña) VALUES (?, ?, ?, ?)";

        var valores = [
            nombre,
            apellidos,
            usuario,
            contraseña
        ];

        conexion.query(sqlInsertar, valores, function(err, resultado) {

            if (err) {
                console.log("Error creando sanitario:", err);
                return callback(null);
            }

            return callback(resultado.insertId);
        });
    });
}

function editarDatos(idSanitario, datosSanitario, callback) {

    var sqlComprobar =
        "SELECT * FROM sanitarios WHERE usuario = ? AND id != ?";

    conexion.query(
        sqlComprobar,
        [datosSanitario.usuario, idSanitario],
        function(err, resultado) {

            if (err) {
                console.log("Error comprobando el sanitario:", err);
                return callback(null);
            }

            if (resultado.length > 0) {
                return callback(null);
            }

            var sqlActualizar =
                "UPDATE sanitarios SET nombre = ?, apellidos = ?, usuario = ?, contraseña = ? WHERE id = ?";

            var valores = [
                datosSanitario.nombre,
                datosSanitario.apellidos,
                datosSanitario.usuario,
                datosSanitario.contraseña,
                idSanitario
            ];

            conexion.query(sqlActualizar, valores, function(err, resultado) {

                if (err) {
                    console.log("Error actualizando sanitario:", err);
                    return callback(null);
                }

                if (resultado.affectedRows == 0) {
                    return callback(null);
                }

                return callback(true);
            });
        }
    );
}

function obtenerSanitario(idSanitario, callback) {

    var sql = "SELECT nombre, apellidos, usuario FROM sanitarios WHERE id = ?";

    conexion.query(sql, [idSanitario], function(err, resultado) {

        if (err) {
            console.log("Error al obtener el sanitario:", err);
            return callback(null);
        }

        if (resultado.length == 0) {
            return callback(null);
        }

        return callback(resultado[0]);
    });
}

function obtenerRecursos(idModelo, callback) {

    var sql = "SELECT * FROM recursos WHERE modelo = ? AND estado = 0";

    conexion.query(sql, [idModelo], function(err, resultado) {

        if (err) {
            console.log("Error al obtener los recursos:", err);
            return callback([]);
        }

        return callback(resultado);
    });
}

function obtenerRecurso(idRecurso, callback) {

    var sql = "SELECT * FROM recursos WHERE id = ?";

    conexion.query(sql, [idRecurso], function(err, resultado) {

        if (err) {
            console.log("Error al obtener el recurso:", err);
            return callback(null);
        }

        if (resultado.length == 0) {
            return callback(null);
        }

        return callback(resultado[0]);
    });
}

function obtenerReservas(idSanitario, callback) {

    var sql = `
        SELECT
            r.id,
            r.recurso,
            c.nombre AS categoria,
            m.nombre AS modelo,
            u.nombre AS ubicacion,
            rec.numero_serie,
            r.horas_estimadas,
            r.fecha_peticion,
            r.fecha_inicio,
            r.fecha_fin
        FROM reservas r
        INNER JOIN recursos rec ON r.recurso = rec.id
        INNER JOIN categorias c ON rec.categoria = c.id
        INNER JOIN modelos m ON rec.modelo = m.id
        INNER JOIN ubicaciones u ON rec.ubicacion = u.id
        WHERE r.sanitario = ?
    `;

    conexion.query(sql, [idSanitario], function(err, reservasSanitario) {

        if (err) {
            console.log("Error al obtener las reservas:", err);
            return callback([]);
        }

        var ahora = new Date();
        var pendientes = 0;

        for (var i = 0; i < reservasSanitario.length; i++) {

            if (reservasSanitario[i].fecha_inicio == null) {
                pendientes++;
            }
        }

        if (pendientes == 0) {
            return callback(reservasSanitario);
        }

        var sqlActivas = `
            SELECT recurso, fecha_inicio, horas_estimadas
            FROM reservas
            WHERE fecha_inicio IS NOT NULL
            AND fecha_fin IS NULL
        `;

        conexion.query(sqlActivas, function(err, reservasActivas) {

            if (err) {
                console.log("Error al obtener las reservas activas:", err);
                return callback([]);
            }

            for (var i = 0; i < reservasSanitario.length; i++) {

                reservasSanitario[i].horas_restantes = 0;

                if (reservasSanitario[i].fecha_inicio == null) {

                    for (var j = 0; j < reservasActivas.length; j++) {

                        if (Number(reservasActivas[j].recurso) ===
                            Number(reservasSanitario[i].recurso)) {

                            var fechaInicio =
                                new Date(reservasActivas[j].fecha_inicio);

                            var finEstimado =
                                new Date(
                                    fechaInicio.getTime() +
                                    reservasActivas[j].horas_estimadas * 3600000
                                );

                            var diff =
                                (finEstimado - ahora) / 3600000;

                            reservasSanitario[i].horas_restantes =
                                diff > 0
                                    ? parseFloat(diff.toFixed(1))
                                    : 0;

                            break;
                        }
                    }
                }
            }

            return callback(reservasSanitario);
        });
    });
}

function obtenerResenyas(idRecurso, callback) {

    var sql = "SELECT * FROM resenyas WHERE recurso = ?";

    conexion.query(sql, [idRecurso], function(err, resultado) {

        if (err) {
            console.log("Error al obtener las reseñas:", err);
            return callback([]);
        }

        return callback(resultado);
    });
}

function obtenerRecursosDisponibles(idModelo, callback) {

    var sql = `
        SELECT
            rec.id,
            rec.numero_serie,
            u.nombre AS ubicacion,
            AVG(re.valor) AS valoracion,
            ra.fecha_inicio,
            ra.horas_estimadas
        FROM recursos rec
        INNER JOIN ubicaciones u ON rec.ubicacion = u.id
        LEFT JOIN resenyas re ON re.recurso = rec.id
        LEFT JOIN reservas ra ON ra.recurso = rec.id
            AND ra.fecha_inicio IS NOT NULL
            AND ra.fecha_fin IS NULL
        WHERE rec.modelo = ?
        AND rec.estado = 0
        GROUP BY
            rec.id,
            rec.numero_serie,
            u.nombre,
            ra.fecha_inicio,
            ra.horas_estimadas
    `;

    conexion.query(sql, [idModelo], function(err, resultado) {

        if (err) {
            console.log("Error al obtener recursos disponibles:", err);
            return callback([]);
        }

        var ahora = new Date();

        for (var i = 0; i < resultado.length; i++) {

            // Valoración
            if (resultado[i].valoracion == null) {
                resultado[i].valoracion = "-";
            } else {
                resultado[i].valoracion =
                    Number(resultado[i].valoracion).toFixed(1);
            }

            // Tiempo restante
            resultado[i].horas_restantes = "Disponible";

            if (resultado[i].fecha_inicio != null) {

                var fechaInicio =
                    new Date(resultado[i].fecha_inicio);

                var finEstimado =
                    new Date(
                        fechaInicio.getTime() +
                        resultado[i].horas_estimadas * 3600000
                    );

                var diff =
                    (finEstimado - ahora) / 3600000;

                if (diff > 0) {
                    resultado[i].horas_restantes =
                        diff.toFixed(1);
                }
            }

            // Estos dos campos solo los necesitábamos
            // para hacer el cálculo.
            delete resultado[i].fecha_inicio;
            delete resultado[i].horas_estimadas;
        }

        return callback(resultado);
    });
}


function reservarRecurso(idRecurso, idSanitario, horasEstimadas, callback) {

    var sqlComprobar = "SELECT * FROM recursos WHERE id = ?";

    conexion.query(sqlComprobar, [idRecurso], function(err, resultado) {

        if (err) {
            console.log("Error comprobando el recurso:", err);
            return callback(null);
        }

        if (resultado.length == 0) {
            return callback(null);
        }

        var sqlInsertar = `
            INSERT INTO reservas
            (recurso, sanitario, horas_estimadas, fecha_peticion, fecha_inicio, fecha_fin)
            VALUES (?, ?, ?, NOW(), NULL, NULL)
        `;

        var valores = [
            idRecurso,
            idSanitario,
            horasEstimadas
        ];

        conexion.query(sqlInsertar, valores, function(err, resultado) {

            if (err) {
                console.log("Error creando la reserva:", err);
                return callback(null);
            }

            return callback(resultado.insertId);
        });
    });
}

function iniciarReserva(idReserva, callback) {

    var sqlReserva = "SELECT * FROM reservas WHERE id = ?";

    conexion.query(sqlReserva, [idReserva], function(err, resultado) {

        if (err) {
            console.log("Error buscando la reserva:", err);
            return callback(null);
        }

        if (resultado.length == 0) {
            return callback(null);
        }

        var reservaTarget = resultado[0];

        var sqlActivas = `
            SELECT *
            FROM reservas
            WHERE recurso = ?
            AND fecha_inicio IS NOT NULL
            AND fecha_fin IS NULL
            AND id != ?
        `;

        conexion.query(
            sqlActivas,
            [reservaTarget.recurso, idReserva],
            function(err, reservasActivas) {

                if (err) {
                    console.log("Error comprobando reservas activas:", err);
                    return callback(null);
                }

                var ahora = new Date();

                for (var i = 0; i < reservasActivas.length; i++) {

                    var fechaInicio =
                        new Date(reservasActivas[i].fecha_inicio);

                    var finEstimado =
                        new Date(
                            fechaInicio.getTime() +
                            reservasActivas[i].horas_estimadas * 3600000
                        );

                    if (ahora < finEstimado) {
                        return callback(null);
                    }
                }

                var sqlCerrar = `
                    UPDATE reservas
                    SET fecha_fin = NOW()
                    WHERE recurso = ?
                    AND fecha_inicio IS NOT NULL
                    AND fecha_fin IS NULL
                    AND id != ?
                `;

                conexion.query(
                    sqlCerrar,
                    [reservaTarget.recurso, idReserva],
                    function(err) {

                        if (err) {
                            console.log("Error cerrando reserva anterior:", err);
                            return callback(null);
                        }

                        var sqlIniciar =
                            "UPDATE reservas SET fecha_inicio = NOW() WHERE id = ?";

                        conexion.query(
                            sqlIniciar,
                            [idReserva],
                            function(err, resultado) {

                                if (err) {
                                    console.log("Error iniciando la reserva:", err);
                                    return callback(null);
                                }

                                if (resultado.affectedRows == 0) {
                                    return callback(null);
                                }

                                return callback(true);
                            }
                        );
                    }
                );
            }
        );
    });
}

function finalizarReserva(idReserva, callback) {

    var sql = "UPDATE reservas SET fecha_fin = NOW() WHERE id = ?";

    conexion.query(sql, [idReserva], function(err, resultado) {

        if (err) {
            console.log("Error finalizando la reserva:", err);
            return callback(null);
        }

        if (resultado.affectedRows == 0) {
            return callback(null);
        }

        return callback(true);
    });
}

function cancelarReserva(idReserva, callback) {

    var sql = "DELETE FROM reservas WHERE id = ?";

    conexion.query(sql, [idReserva], function(err, resultado) {

        if (err) {
            console.log("Error cancelando la reserva:", err);
            return callback(null);
        }

        if (resultado.affectedRows == 0) {
            return callback(null);
        }

        return callback(true);
    });
}


function crearResenya(idRecurso, idSanitario, valoracion, descripcion, callback) {

    var sql = `
        INSERT INTO resenyas
        (recurso, sanitario, fecha, valor, descripcion)
        VALUES (?, ?, NOW(), ?, ?)
    `;

    var valores = [
        idRecurso,
        idSanitario,
        valoracion,
        descripcion
    ];

    conexion.query(sql, valores, function(err, resultado) {

        if (err) {
            console.log("Error creando la reseña:", err);
            return callback(null);
        }

        return callback(resultado.insertId);
    });
}

function tiempoPendiente(idRecurso, callback) {

    var sql = `
        SELECT fecha_inicio, horas_estimadas
        FROM reservas
        WHERE recurso = ?
        AND fecha_inicio IS NOT NULL
        AND fecha_fin IS NULL
    `;

    conexion.query(sql, [idRecurso], function(err, resultado) {

        if (err) {
            console.log("Error calculando el tiempo pendiente:", err);
            return callback(0);
        }

        var ahora = new Date();
        var tiempoRestante = 0;

        for (var i = 0; i < resultado.length; i++) {

            var fechaInicio = new Date(resultado[i].fecha_inicio);

            var finEstimado = new Date(
                fechaInicio.getTime() +
                resultado[i].horas_estimadas * 3600000
            );

            var diff = (finEstimado - ahora) / 3600000;

            tiempoRestante = diff > 0 ? diff : 0;
        }

        return callback(tiempoRestante);
    });
}

function calcularTiempoReserva(idReserva, callback) {

    var sql = `
        SELECT fecha_inicio, fecha_fin
        FROM reservas
        WHERE id = ?
    `;

    conexion.query(sql, [idReserva], function(err, resultado) {

        if (err) {
            console.log("Error calculando el tiempo de reserva:", err);
            return callback(null);
        }

        if (resultado.length == 0) {
            return callback(null);
        }

        if (resultado[0].fecha_fin == null) {
            return callback(null);
        }

        var fechaInicio = new Date(resultado[0].fecha_inicio);
        var fechaFin = new Date(resultado[0].fecha_fin);

        var tiempoEnHoras =
            (fechaFin - fechaInicio) / (1000 * 60 * 60);

        return callback(tiempoEnHoras);
    });
}

function contarReservasPendientes(callback) {

    var sql = `
        SELECT COUNT(*) AS total
        FROM reservas
        WHERE fecha_peticion IS NOT NULL
        AND fecha_inicio IS NULL
    `;

    conexion.query(sql, function(err, resultado) {

        if (err) {
            console.log("Error contando reservas pendientes:", err);
            return callback(0);
        }

        return callback(resultado[0].total);
    });
}

function duplicarReserva(idReserva, callback) {

    var sql = `
        INSERT INTO reservas
        (recurso, sanitario, horas_estimadas, fecha_peticion, fecha_inicio, fecha_fin)
        SELECT recurso, sanitario, horas_estimadas, NOW(), NULL, NULL
        FROM reservas
        WHERE id = ?
    `;

    conexion.query(sql, [idReserva], function(err, resultado) {

        if (err) {
            console.log("Error duplicando la reserva:", err);
            return callback(null);
        }

        if (resultado.affectedRows == 0) {
            return callback(null);
        }

        return callback(true);
    });
}

function obtenerSanitariosPendientes(idRecurso, callback) {

    var sql = `
        SELECT sanitario
        FROM reservas
        WHERE recurso = ?
        AND fecha_inicio IS NULL
    `;

    conexion.query(sql, [idRecurso], function(err, resultado) {

        if (err) {
            console.log("Error obteniendo sanitarios pendientes:", err);
            return callback([]);
        }

        var sanitariosPendientes = [];

        for (var i = 0; i < resultado.length; i++) {
            sanitariosPendientes.push(resultado[i].sanitario);
        }

        return callback(sanitariosPendientes);
    });
}

// Retorna todos los sanitarios con reserva no finalizada (fecha_fin==null) del recurso,
// excluyendo al sanitario que realiza la acción.
function obtenerSanitariosNoFinalizados(idRecurso, idSanitarioExcluir, callback) {

    var sql = `
        SELECT DISTINCT sanitario
        FROM reservas
        WHERE recurso = ?
        AND fecha_fin IS NULL
        AND sanitario != ?
    `;

    conexion.query(
        sql,
        [idRecurso, idSanitarioExcluir],
        function(err, resultado) {

            if (err) {
                console.log("Error obteniendo sanitarios no finalizados:", err);
                return callback([]);
            }

            var sanitariosResultado = [];

            for (var i = 0; i < resultado.length; i++) {
                sanitariosResultado.push(resultado[i].sanitario);
            }

            return callback(sanitariosResultado);
        }
    );
}
 
function asignarArea(idSanitario, datosSanitario, callback) {

    var sql = 'UPDATE sanitarios SET area=? WHERE id=?';

    var valores = [
        datosSanitario.area,
        idSanitario
    ];

    conexion.query(sql, valores, function(err, resultado) {

        if (err) {
            console.log("Error asignando área:", err);
            return callback(null);
        }

        if (resultado.affectedRows == 0) {
            return callback(null);
        }

        return callback(true);
    });
}





app.registerAsync("obtenerCategorias", obtenerCategorias);
app.registerAsync("obtenerModelos", obtenerModelos);
app.registerAsync("loginSanitario", loginSanitario);
app.registerAsync("crearSanitario", crearSanitario);
app.registerAsync("editarDatos", editarDatos);
app.registerAsync("obtenerSanitario", obtenerSanitario);
app.registerAsync("obtenerRecursos", obtenerRecursos);
app.registerAsync("obtenerRecurso", obtenerRecurso);
app.registerAsync("obtenerReservas", obtenerReservas);
app.registerAsync("obtenerResenyas", obtenerResenyas);
app.registerAsync("obtenerRecursosDisponibles", obtenerRecursosDisponibles);
app.registerAsync("reservarRecurso", reservarRecurso);
app.registerAsync("iniciarReserva", iniciarReserva);
app.registerAsync("finalizarReserva", finalizarReserva);
app.registerAsync("cancelarReserva", cancelarReserva);
app.registerAsync("crearResenya", crearResenya);
app.registerAsync("tiempoPendiente", tiempoPendiente);
app.registerAsync("calcularTiempoReserva", calcularTiempoReserva);
app.registerAsync("contarReservasPendientes", contarReservasPendientes);
app.registerAsync("duplicarReserva", duplicarReserva);
app.registerAsync("obtenerSanitariosPendientes", obtenerSanitariosPendientes);
app.registerAsync("obtenerSanitariosNoFinalizados", obtenerSanitariosNoFinalizados);
app.registerAsync("asignarArea", asignarArea);