const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

function convertirParametros(sql) {

    var contador = 0;

    return sql.replace(/\?/g, function() {
        contador++;
        return "$" + contador;
    });
}

var conexion = {

    query: function(sql, valores, callback) {

        if (typeof valores === "function") {
            callback = valores;
            valores = [];
        }

        var sqlPostgres = convertirParametros(sql);

        pool.query(sqlPostgres, valores)
            .then(function(resultado) {

                var filas = resultado.rows;

                filas.affectedRows = resultado.rowCount;

                if (resultado.rows.length > 0 &&
                    resultado.rows[0].id !== undefined) {

                    filas.insertId = resultado.rows[0].id;
                }

                callback(null, filas);
            })
            .catch(function(error) {

                callback(error, null);
            });
    }
};

pool.connect()
    .then(function(cliente) {
        console.log("Conexión con Supabase correcta.");
        cliente.release();
    })
    .catch(function(error) {
        console.log("Error conectando con Supabase:", error);
    });

module.exports = conexion;