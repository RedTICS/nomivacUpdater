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
//const consulta: any = '';// = "SELECT ID AS idvacuna, CONVERT(varchar(8), NroDocumento)  AS documento, Apellido AS apellido, Nombre AS nombre, FechaNacimiento AS fechaNacimiento, CASE Sexo WHEN 'M' THEN 'masculino' ELSE 'femenino' END AS sexo  , Vacuna AS vacuna, Dosis AS dosis, FechaAplicacion AS fechaAplicacion, Establecimiento AS efector FROM dbo.Nomivac WHERE id > 2953385 and CodigoAplicacion IS NOT null ORDER BY ID";
const servicio: any = new servicioMssql();

//Se importan los datos desde SQL a un archivo json,
//Luego con mongoimport se pueden insertar los datos a la bd de Mongo

class importer {

    constructor() { }

    getLastInsertedInMongo() {       

        let consulta;

        MongoClient.connect(url, function (err: any, dbMongo: any) {

            if (err) {
                console.log('Error conectando a mongoClient', err);
                dbMongo.close();
            }

            dbMongo.collection(coleccion).find().sort({ _id: -1 }).limit(1).toArray(function (err, data) {                

                consulta = "SELECT top 5 ID AS idvacuna, CONVERT(varchar(8), NroDocumento)  AS documento, Apellido AS apellido, Nombre AS nombre, FechaNacimiento AS fechaNacimiento, CASE Sexo WHEN 'M' THEN 'masculino' ELSE 'femenino' END AS sexo  , Vacuna AS vacuna, Dosis AS dosis, FechaAplicacion AS fechaAplicacion, Establecimiento AS efector FROM dbo.Nomivac WHERE id > " + data[0].idvacuna + " and CodigoAplicacion IS NOT null ORDER BY ID"
                
                getVacunasNomivacSql(consulta);
                
                dbMongo.close()
            })
        });
    }
}

function getVacunasNomivacSql(consulta: any) {

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
}

function updateMongo(listadoNomivac: any) {
    let x = 0;
    MongoClient.connect(url, function (err: any, dbMongo: any) {

        if (err) {
            console.log('Error conectando a mongoClient', err);
            dbMongo.close();
        }

        listadoNomivac.forEach((listado: any) => {

            dbMongo.collection(coleccion).save(listado, function (err2: any, result: any) {

                if (err2) {
                    console.log('Error save:', err2);
                    dbMongo.close();

                } else {
                    console.log('Insertando N° ', x);
                    x++;
                    dbMongo.close();
                }
            });
        });
    })
}


export default new importer().getLastInsertedInMongo();
