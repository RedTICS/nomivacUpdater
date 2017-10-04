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
//const consulta: any = '';// = "SELECT ID AS idvacuna, CONVERT(varchar(8), NroDocumento)  AS documento, Apellido AS apellido, Nombre AS nombre, FechaNacimiento AS fechaNacimiento, CASE Sexo WHEN 'M' THEN 'masculino' ELSE 'femenino' END AS sexo  , Vacuna AS vacuna, Dosis AS dosis, FechaAplicacion AS fechaAplicacion, Establecimiento AS efector FROM dbo.Nomivac WHERE id > 2953385 and CodigoAplicacion IS NOT null ORDER BY ID";
var servicio = new nomivacImporter_1.servicioMssql();
//Se importan los datos desde SQL a un archivo json,
//Luego con mongoimport se pueden insertar los datos a la bd de Mongo
var importer = (function () {
    function importer() {
    }
    importer.prototype.getLastInsertedInMongo = function () {
        var consulta;
        var parametro = '';
        MongoClient.connect(url, function (err, dbMongo) {
            if (err) {
                console.log('Error conectando a mongoClient', err);
                dbMongo.close();
            }
            dbMongo.collection(coleccion).find().sort({ _id: -1 }).limit(1).toArray(function (err, data) {
                console.log("Datata: ", data);
                if (data.length > 0) {
                    parametro = " id > " + data[0].idvacuna + " and";
                }
                consulta = "SELECT top 500000 ID AS idvacuna, CONVERT(varchar(8), NroDocumento)  AS documento, Apellido AS apellido, Nombre AS nombre, FechaNacimiento AS fechaNacimiento, CASE Sexo WHEN 'M' THEN 'masculino' ELSE 'femenino' END AS sexo  , Vacuna AS vacuna, Dosis AS dosis, FechaAplicacion AS fechaAplicacion, Establecimiento AS efector FROM dbo.Nomivac WHERE " + parametro + " CodigoAplicacion IS NOT null ORDER BY ID";
                console.log("Consulta: ", consulta);
                getVacunasNomivacSql(consulta);
                dbMongo.close();
            });
        });
    };
    return importer;
}());
function getVacunasNomivacSql(consulta) {
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
}
function updateMongo(listadoNomivac) {
    var x = 0;
    MongoClient.connect(url, function (err, dbMongo) {
        if (err) {
            console.log('Error conectando a mongoClient', err);
            dbMongo.close();
        }
        listadoNomivac.forEach(function (listado) {
            dbMongo.collection(coleccion).save(listado, function (err2, result) {
                if (err2) {
                    console.log('Error save:', err2);
                    dbMongo.close();
                }
                else {
                    console.log('Insertando N° ', x);
                    x++;
                    dbMongo.close();
                }
            });
        });
        console.log("Termino");
    });
}
exports["default"] = new importer().getLastInsertedInMongo();
