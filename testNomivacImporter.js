"use strict";
exports.__esModule = true;
var configPrivate = require("./config.private");
var nomivacImporter_1 = require("./nomivacImporter");
// Require
var MongoClient = require('mongodb').MongoClient;
var url = configPrivate.configPrivate.mongoDB.host;
var coleccion = configPrivate.configPrivate.mongoDB.collection;
var usuario = configPrivate.configPrivate.auth.user;
var pass = configPrivate.configPrivate.auth.password;
var server = configPrivate.configPrivate.serverSql.server;
var db = configPrivate.configPrivate.serverSql.database;
var consulta = 'SELECT NroDocumento AS dni, apellido, FechaNacimiento, Sexo, Vacuna, Dosis, FechaAplicacion, FechaRegistro FROM dbo.Nomivac';
var servicio = new nomivacImporter_1.servicioMssql();
//Se importan los datos desde SQL a un archivo json,
//Luego con mongoimport se pueden insertar los datos a la bd de Mongo
servicio.getVacunasNomivac(usuario, pass, server, db, consulta)
    .then(function (resultado) {
    if (resultado == null) {
        console.log('No encontrado');
    }
    else {
        console.log('Iniciando actualizacion...');
        updateMongo(resultado);
    }
})["catch"](function (err) {
    console.error('Error**:' + err);
});
function updateMongo(listadoNomivac) {
    MongoClient.connect(url, function (err, dbMongo) {
        if (err) {
            console.log('Error conectando a mongoClient', err);
            dbMongo.close();
        }
        listadoNomivac.forEach(function (os) {
            console.log("Mongo db ", dbMongo);
            dbMongo.collection(coleccion).save(os, function (err2, result) {
                if (err2) {
                    console.log('Error save:', err2);
                    dbMongo.close();
                }
                else {
                    console.log('Se ha insertado:', os);
                    dbMongo.close();
                }
            });
        });
    });
}
