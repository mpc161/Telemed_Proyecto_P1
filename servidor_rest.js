var conexion = require("./conexion_mysql.js");

var express = require("express");
var jwt = require("jwt-simple");
var clave = process.env.JWT_SECRET || "miSecretoMasOscuro";
var app = express();
app.use(express.static("cliente_rest"));
app.get("/", function(req, res) {
    res.sendFile(
        __dirname + "/cliente_rest/index.html"
    );
});

var cors = require("cors");
app.use(cors());


app.use("/appCliente", express.static("cliente_rest"));
app.use(express.json());



app.post("/api/gestores/login", (req, res) => {

  var usuario = req.body.usuario;
  var contraseña = req.body.contraseña;

  var sql =
    "SELECT * FROM gestores WHERE usuario = ? AND contraseña = ?";

  conexion.query(
    sql,
    [usuario, contraseña],
    function(err, resultado) {

      if (err) {

        console.log("Error al realizar el login:", err);

        res.status(500).json(
          "Error al realizar la consulta"
        );

      } else {

        if (resultado.length > 0) {

          var contenido = {
            usuario: resultado[0].id,
            expira: Date.now() + 60 * 60 * 1000
          };

          var token =
            jwt.encode(contenido, clave);

          res.status(200).json({
            id: resultado[0].id,
            token: token
          });

        } else {

          res.status(403).json(
            "Credenciales incorrectas."
          );
        }
      }
    }
  );
});

app.post("/api/gestores", function(req, res) {

  var sql = "INSERT INTO gestores (nombre, apellidos, usuario, contraseña) VALUES (?, ?, ?, ?)";

  var valores = [
    req.body.nombre,
    req.body.apellidos,
    req.body.usuario,
    req.body.contraseña
  ];

  conexion.query(sql, valores, function(err, resultado) {
    if (err) {
      console.log("Error al añadir gestor:", err);
      res.status(500).json("Error al añadir el gestor.");
    } else {
      res.status(201).json("Gestor añadido correctamente a la base de datos.");
    }
  });
});

app.use("/api", function(req, res, next) {

    var token = req.query.token;

    if (!token) {
        res.status(401).json("No se ha proporcionado token.");
        return;
    }

    try {

        var contenido = jwt.decode(token, clave);

        if (!contenido.usuario) {
            res.status(401).json("Token no válido.");
            return;
        }

        if (contenido.expira < Date.now()) {
            res.status(401).json("Token caducado.");
            return;
        }

        next();

    } catch (error) {

        console.log("Error validando JWT:", error);

        res.status(401).json("Token no válido.");
    }
});

app.get("/api/ubicaciones", function(req, res) {
  var sql = "SELECT * FROM ubicaciones";

  conexion.query(sql, function(err, ubicaciones) {
    if (err) {
      console.log("Error al obtener las ubicaciones:", err);
      res.status(500).json("Error al realizar la consulta");
    } else {
      res.status(200).json(ubicaciones);
    }
  });
});

app.get("/api/categorias", function(req, res) {
  var sql = "SELECT * FROM categorias";

  conexion.query(sql, function(err, categorias) {
    if (err) {
      console.log("Error al obtener las categorias:", err);
      res.status(500).json("Error al realizar la consulta");
    } else {
      res.status(200).json(categorias);
    }
  });
});

app.get("/api/modelos", function(req, res) {
  var sql = "SELECT * FROM modelos";

  conexion.query(sql, function(err, modelos) {
    if (err) {
      console.log("Error al obtener los modelos:", err);
      res.status(500).json("Error al realizar la consulta");
    } else {
      res.status(200).json(modelos);
    }
  });
});

app.put("/api/gestores/:id", function(req, res) {

  var idGestor = parseInt(req.params.id);

  var sqlComprobar = "SELECT * FROM gestores WHERE usuario = ? AND id != ?";

  conexion.query(sqlComprobar, [req.body.usuario, idGestor], function(err, resultado) {

    if (err) {
      console.log("Error comprobando el gestor:", err);
      return res.status(500).json("Error al realizar la consulta.");
    }

    if (resultado.length > 0) {
      return res.status(404).json("El login ya existe");
    }

    var sqlActualizar =
      "UPDATE gestores SET nombre = ?, apellidos = ?, usuario = ?, contraseña = ? WHERE id = ?";

    var valores = [
      req.body.nombre,
      req.body.apellidos,
      req.body.usuario,
      req.body.contraseña,
      idGestor
    ];

    conexion.query(sqlActualizar, valores, function(err, resultado) {

      if (err) {
        console.log("Error actualizando gestor:", err);
        return res.status(500).json("Error al actualizar el gestor.");
      }

      if (resultado.affectedRows > 0) {
        res.status(201).json("Se han actualizado correctamente los datos.");
      } else {
        res.status(404).json(
          "El usuario que está intentando modificar no se encuentra en la base de datos"
        );
      }

    });
  });
});

app.get("/api/gestores/:id", function(req, res) {

  var idGestor = parseInt(req.params.id);

  var sql = "SELECT id, nombre, apellidos, usuario FROM gestores WHERE id = ?";

  conexion.query(sql, [idGestor], function(err, resultado) {

    if (err) {
      console.log("Error obteniendo gestor:", err);
      return res.status(500).json("Error al realizar la consulta.");
    }

    if (resultado.length == 0) {
      return res.status(404).json("Gestor no encontrado.");
    }

    res.status(200).json(resultado[0]);
  });
}); 

app.get("/api/sanitarios/:id", function(req, res) {

  var idSanitario = parseInt(req.params.id);

  var sql = "SELECT id, nombre, apellidos, usuario FROM sanitarios WHERE id = ?";

  conexion.query(sql, [idSanitario], function(err, resultado) {

    if (err) {
      console.log("Error obteniendo sanitario:", err);
      return res.status(500).json("Error al realizar la consulta.");
    }

    if (resultado.length == 0) {
      return res.status(404).json("Sanitario no encontrado.");
    }

    res.status(200).json(resultado[0]);
  });
});

app.get("/api/recursos", function(req, res) {

  var categoria = req.query.categoria;
  var modelo = req.query.modelo;
  var ubicacion = req.query.ubicacion;
  var estado = req.query.estado;

  var sql = "SELECT * FROM recursos WHERE 1=1";
  var valores = [];

  if (categoria) {
    sql += " AND categoria = ?";
    valores.push(categoria);
  }

  if (modelo) {
    sql += " AND modelo = ?";
    valores.push(modelo);
  }

  if (ubicacion) {
    sql += " AND ubicacion = ?";
    valores.push(ubicacion);
  }

  if (estado !== undefined && estado !== "" && estado !== "-1") {
    sql += " AND estado = ?";
    valores.push(estado);
  }

  conexion.query(sql, valores, function(err, resultado) {

    if (err) {
      console.log("Error al obtener los recursos:", err);
      return res.status(500).json("Error al realizar la consulta.");
    }

    res.status(200).json(resultado);
  });
});

app.get("/api/recursos/:id", function(req, res) {

  var idBusqueda = parseInt(req.params.id);

  var sql = "SELECT * FROM recursos WHERE numero_serie = ? OR id = ?";

  conexion.query(sql, [idBusqueda, idBusqueda], function(err, resultado) {

    if (err) {
      console.log("Error al obtener el recurso:", err);
      return res.status(500).json("Error al realizar la consulta.");
    }

    if (resultado.length == 0) {
      return res.status(404).json("Recurso no encontrado.");
    }

    res.status(200).json(resultado[0]);
  });
});

app.post("/api/recursos", function(req, res) {

  var recurso = req.body;

  var sql = `
    INSERT INTO recursos
    (categoria, modelo, ubicacion, numero_serie, estado)
    VALUES (?, ?, ?, ?, ?)
    RETURNING id
  `;

  var valores = [
    recurso.categoria,
    recurso.modelo,
    recurso.ubicacion,
    recurso.numero_serie,
    recurso.estado
  ];

  conexion.query(sql, valores, function(err, resultado) {

    if (err) {
      console.log("Error al crear el recurso:", err);
      return res.status(500).json("Error al crear el recurso");
    }

    res.status(201).json({
      id: resultado.insertId
    });
  });
});

app.put("/api/recursos/:id", function(req, res) {

  var numSerie = parseInt(req.params.id);

  var sql = "UPDATE recursos SET modelo = ?, ubicacion = ?, estado = ? WHERE numero_serie = ?";

  var valores = [
    req.body.modelo,
    req.body.ubicacion,
    req.body.estado,
    numSerie
  ];

  conexion.query(sql, valores, function(err, resultado) {

    if (err) {
      console.log("Error actualizando recurso:", err);
      return res.status(500).json("Error actualizando el recurso.");
    }

    if (resultado.affectedRows > 0) {
      res.status(200).json("El recurso se ha actualizado en la base de datos.");
    } else {
      res.status(404).json("Error actualizando el recurso.");
    }
  });
});

app.get("/api/recursos/:id/reservas", function(req, res) {

  var idRecurso = parseInt(req.params.id);

  var sql = "SELECT * FROM reservas WHERE recurso = ?";

  conexion.query(sql, [idRecurso], function(err, resultado) {

    if (err) {
      console.log("Error al obtener las reservas:", err);
      return res.status(500).json("Error al realizar la consulta.");
    }

    res.status(200).json(resultado);
  });
});

app.get("/api/recursos/:id/resenyas", function(req, res) {

  var idRecurso = parseInt(req.params.id);

  var sql = "SELECT * FROM resenyas WHERE recurso = ?";

  conexion.query(sql, [idRecurso], function(err, resultado) {

    if (err) {
      console.log("Error al obtener las reseñas:", err);
      return res.status(500).json("Error al realizar la consulta.");
    }

    res.status(200).json(resultado);
  });
});

app.delete("/api/recursos/:id", function(req, res) {

  var numSerie = parseInt(req.params.id);

  var sql = "DELETE FROM recursos WHERE numero_serie = ?";

  conexion.query(sql, [numSerie], function(err, resultado) {

    if (err) {
      console.log("Error eliminando recurso:", err);
      return res.status(500).json("Error al borrar el recurso.");
    }

    if (resultado.affectedRows > 0) {
      res.status(200).json("Recurso eliminado correctamente.");
    } else {
      res.status(404).json("No se ha encontrado el recurso para eliminar.");
    }
  });
});

app.post("/api/areas", function(req, res){
  var area = req.body;

  var sql = `
    INSERT INTO areas
    (codigo, nombre, gestor)
    VALUES (?, ?, ?)
    RETURNING id
  `;

  var valores = [
    area.codigo,
    area.nombre,
    area.gestor
  ];
 
  conexion.query(sql, valores, function(err, resultado) {

    if (err) {
      console.log("Error al crear area:", err);
      return res.status(500).json("Error al crear area");
    }

    res.status(201).json({
      id: resultado.insertId
    });
  });
});

app.get("/api/reservas/ministerio", function(req, res) {

  var sql = `
    SELECT
      reservas.id,
      sanitarios.nombre,
      sanitarios.apellidos,
      categorias.nombre AS categoria,
      reservas.horas_estimadas,
      reservas.fecha_peticion AS fec_pet,
      reservas.fecha_inicio AS fec_ini,
      reservas.fecha_fin AS fecha_fin

    FROM reservas

    INNER JOIN sanitarios
      ON reservas.sanitario = sanitarios.id

    INNER JOIN recursos
      ON reservas.recurso = recursos.id

    INNER JOIN categorias
      ON recursos.categoria = categorias.id
  `;

  conexion.query(sql, function(err, resultado) {

    if (err) {
      console.log(
        "Error obteniendo las reservas para el Ministerio:",
        err
      );

      return res.status(500).json(
        "Error al obtener las reservas."
      );
    }

    res.status(200).json(resultado);
  });
});

var puerto = process.env.PORT || 3000;

app.listen(puerto, () => {
  console.log("Servidor escuchando en el puerto " + puerto);
});