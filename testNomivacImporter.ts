import * as configPrivate from './config.private';
import { servicioMssql } from './nomivacImporter'
// import { Promise } from 'es6-promise';

import * as log from './logger'
import { exists } from 'fs';
// const errorLog = require('./logger').errorlog;
// const successlog = require('./logger').successlog;

// Require
const MongoClient = require('mongodb').MongoClient;
const url = configPrivate.configPrivate.mongoDB.host;
const coleccion = configPrivate.configPrivate.mongoDB.collection;
const usuario: any = configPrivate.configPrivate.auth.user;
const pass: any = configPrivate.configPrivate.auth.password;
const server: any = configPrivate.configPrivate.serverSql.server;
const db: any = configPrivate.configPrivate.serverSql.database;
const servicio: any = new servicioMssql();


export function getLastInsertedInMongo() {
    let consulta;
    let parametro = '';

    MongoClient.connect(url, function (err: any, dbMongo: any) {

        if (err) {
            console.log('Error conectando a mongoClient', err);
            dbMongo.close();
        }

        dbMongo.collection(coleccion).find().sort({ _id: -1 }).limit(1).toArray(function (err, data) {

            if (data.length > 0) {
                parametro = " id > " + data[0].idvacuna + " and";
                // parametro = " where idCurso > " + data[0].idCurso;
            }

            consulta = "SELECT TOP 3000 ID AS idvacuna, CONVERT(varchar(8), NroDocumento)  AS documento, Apellido AS apellido, Nombre AS nombre, FechaNacimiento AS fechaNacimiento, CASE Sexo WHEN 'M' THEN 'masculino' ELSE 'femenino' END AS sexo  , Vacuna AS vacuna, Dosis AS dosis, FechaAplicacion AS fechaAplicacion, Establecimiento AS efector FROM dbo.Nomivac WHERE " + parametro + " CodigoAplicacion IS NOT null ORDER BY ID";
            // consulta = "select top 1000 * from Cursos " + parametro;

            getVacunasNomivacSql(consulta);

            dbMongo.close()
        })
    });
}


function getVacunasNomivacSql(consulta: any) {

    servicio.getVacunasNomivac(usuario, pass, server, db, consulta)
        .then((resultado: any) => {
            if (resultado.length === 0) {
                return;
            } else {
                console.log('Iniciando actualizacion...')

                updateMongo(resultado);
            }
        }).catch((err: any) => {
            console.error('Error**:' + err)
        });
}

function updateMongo(listadoNomivac: any) {
    let x = 0;
    let requests = listadoNomivac.reduce((promiseChain, item) => {
        return promiseChain.then(async () => new Promise(async (resolve) => {
            log.successLogger.info(`N° ${x}`);
            x++;
            await asyncFunction(item, resolve);
        }));
    }, Promise.resolve());

    requests.then(() => callback(x))
}

function asyncFunction(listado, cb) {
    setTimeout(() => {
        MongoClient.connect(url, function (err: any, dbMongo: any) {
            dbMongo.collection(coleccion).save(listado, function (err2: any, result: any) {

                if (err2) {
                    console.log('Error save:', err2);
                    log.errorLogger.error(`Error Message : ${err2}`);
                    dbMongo.close();

                } else {
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
    getLastInsertedInMongo();
}