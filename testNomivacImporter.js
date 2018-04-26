"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const configPrivate = require("./config.private");
const nomivacImporter_1 = require("./nomivacImporter");
// import { Promise } from 'es6-promise';
const log = require("./logger");
// const errorLog = require('./logger').errorlog;
// const successlog = require('./logger').successlog;
// Require
const MongoClient = require('mongodb').MongoClient;
const url = configPrivate.configPrivate.mongoDB.host;
const coleccion = configPrivate.configPrivate.mongoDB.collection;
const usuario = configPrivate.configPrivate.auth.user;
const pass = configPrivate.configPrivate.auth.password;
const server = configPrivate.configPrivate.serverSql.server;
const db = configPrivate.configPrivate.serverSql.database;
const servicio = new nomivacImporter_1.servicioMssql();
function getLastInsertedInMongo( /*reespaldarDB: boolean*/) {
    //export function getLastInsertedInMongo() {
    let consulta;
    let parametro = '';
    MongoClient.connect(url, function (err, dbMongo) {
        if (err) {
            console.log('Error conectando a mongoClient', err);
            dbMongo.close();
        }
        /*   if (reespaldarDB) {
               if (dbMongo.collection(coleccion)) {
                   if (dbMongo.collection("nomivac_old")) {
                       dbMongo.collection("nomivac_old").drop();
                   }
                   dbMongo.collection(coleccion).rename("nomivac_old");
                   console.log('db respaldada..');
               }
           } */
        dbMongo.collection(coleccion).find().sort({ _id: -1 }).limit(1).toArray(function (err, data) {
            if (data.length > 0) {
                parametro = " id > " + data[0].idvacuna + " and";
                // parametro = " where idCurso > " + data[0].idCurso;
            }
            consulta = "SELECT TOP 3000 ID AS idvacuna, CONVERT(varchar(8), NroDocumento)  AS documento, Apellido AS apellido, Nombre AS nombre, FechaNacimiento AS fechaNacimiento, CASE Sexo WHEN 'M' THEN 'masculino' ELSE 'femenino' END AS sexo  , Vacuna AS vacuna, Dosis AS dosis, FechaAplicacion AS fechaAplicacion, Establecimiento AS efector FROM dbo.Nomivac WHERE " + parametro + " CodigoAplicacion IS NOT null ORDER BY ID";
            // consulta = "select top 1000 * from Cursos " + parametro;
            getVacunasNomivacSql(consulta);
            dbMongo.close();
        });
    });
}
exports.getLastInsertedInMongo = getLastInsertedInMongo;
function getVacunasNomivacSql(consulta) {
    servicio.getVacunasNomivac(usuario, pass, server, db, consulta)
        .then((resultado) => {
        if (resultado.length === 0) {
            return;
        }
        else {
            console.log('Iniciando actualizacion...');
            updateMongo(resultado);
        }
    }).catch((err) => {
        console.error('Error**:' + err);
    });
}
function updateMongo(listadoNomivac) {
    let x = 0;
    let requests = listadoNomivac.reduce((promiseChain, item) => {
        return promiseChain.then(() => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                log.successLogger.info(`N° ${x}`);
                x++;
                yield asyncFunction(item, resolve);
            }));
        }));
    }, Promise.resolve());
    requests.then(() => callback(x));
}
function asyncFunction(listado, cb) {
    setTimeout(() => {
        MongoClient.connect(url, function (err, dbMongo) {
            dbMongo.collection(coleccion).save(listado, function (err2, result) {
                if (err2) {
                    console.log('Error save:', err2);
                    log.errorLogger.error(`Error Message : ${err2}`);
                    dbMongo.close();
                }
                else {
                    log.successLogger.info(`Vacuna insertada: ${listado.idvacuna}`);
                    dbMongo.close();
                }
            });
        });
        cb();
    }, 100);
}
function callback(x) {
    log.successLogger.info(`Se insertaron: ${x} registros`);
    getLastInsertedInMongo( /*false*/);
    //  new importer().getLastInsertedInMongo();
}
//exports.default = new importer().getLastInsertedInMongo();
//db.getCollection('nomivac_old').find().sort({idvacuna:-1}).limit(1);
//# sourceMappingURL=testNomivacImporter.js.map