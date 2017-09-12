import * as configPrivate from './config.private';
import { servicioMssql } from './nomivacImporter'
import { Promise } from 'es6-promise';

// Require
const MongoClient = require('mongodb').MongoClient;
const url = configPrivate.configPrivate.mongoDB.host;
const coleccion = configPrivate.configPrivate.mongoDB.collection;
const usuario: any = configPrivate.configPrivate.auth.user;
const pass: any = configPrivate.configPrivate.auth.password;
const server: any = configPrivate.configPrivate.serverSql.server;
const db: any = configPrivate.configPrivate.serverSql.database;
const consulta: any = 'SELECT NroDocumento AS dni, apellido, FechaNacimiento, Sexo, Vacuna, Dosis, FechaAplicacion, FechaRegistro FROM dbo.Nomivac';
const servicio: any = new servicioMssql();



//Se importan los datos desde SQL a un archivo json,
//Luego con mongoimport se pueden insertar los datos a la bd de Mongo
servicio.getVacunasNomivac(usuario, pass, server, db, consulta)
    .then((resultado: any) => {
        if (resultado == null) {
            console.log('No encontrado');
        } else {
            console.log('Iniciando actualizacion...')
            updateMongo(resultado);
        }
    }).catch((err: any) => {
        console.error('Error**:' + err)
    });

function updateMongo(listadoNomivac: any) {

    MongoClient.connect(url, function (err: any, dbMongo: any) {

        if (err) {
            console.log('Error conectando a mongoClient', err);
            dbMongo.close();
        }

        listadoNomivac.forEach((listado: any) => {
            console.log("Mongo db ", dbMongo);
            dbMongo.collection(coleccion).save(listado, function (err2: any, result: any) {
                
                if (err2) {
                    console.log('Error save:', err2);
                    dbMongo.close();

                } else {
                    console.log('Se ha insertado:', listado);
                    dbMongo.close();
                }
            });
        });
    })
}
