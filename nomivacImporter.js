"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sql = require("mssql");
class servicioMssql {
    getVacunasNomivac(usuario, password, server, db, consulta) {
        var connection = {
            user: usuario,
            password: password,
            server: server,
            database: db,
            requestTimeout: 190000,
            stream: true
        };
        var listaRegistros = [];
        let x = 0;
        return new Promise((resolve, reject) => {
            sql.connect(connection, function (err) {
                if (err) {
                    console.log("Error de Conexión sql", err);
                    reject(err);
                }
                var request = new sql.Request();
                request.stream = true;
                request.query(consulta);
                // Puede ser una consulta a una vista que tenga toda la información
                request.on('row', function (row) {
                    // Emitted for each row in a recordset
                    //      console.log("N° ", x);
                    x++;
                    listaRegistros.push(row);
                });
                request.on('error', function (err) {
                    // May be emitted multiple times
                });
                request.on('done', function (affected) {
                    // Always emitted as the last one
                    console.log("Cant de registros ", listaRegistros.length);
                    sql.close();
                    resolve(listaRegistros);
                });
            });
            sql.on('error', function (err) {
                console.log("Error de conexión", err);
                reject(err);
            });
        }); //Fin Promise
    }
}
exports.servicioMssql = servicioMssql;
//# sourceMappingURL=nomivacImporter.js.map