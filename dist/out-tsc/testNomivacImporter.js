import * as configPrivate from './config.private';
import { servicioMssql } from './nomivacImporter';
// Require
const MongoClient = require('mongodb').MongoClient;
const url = configPrivate.configPrivate.mongoDB.host;
const coleccion = configPrivate.configPrivate.mongoDB.collection;
const usuario = configPrivate.configPrivate.auth.user;
const pass = configPrivate.configPrivate.auth.password;
const server = configPrivate.configPrivate.serverSql.server;
const db = configPrivate.configPrivate.serverSql.database;
const consulta = 'SELECT  top 1 NroDocumento AS dni, apellido, FechaNacimiento, Sexo, Vacuna, Dosis, FechaAplicacion, FechaRegistro FROM dbo.Nomivac';
const servicio = new servicioMssql();
//Se importan los datos desde SQL a un archivo json,
//Luego con mongoimport se pueden insertar los datos a la bd de Mongo
servicio.getVacunasNomivac(usuario, pass, server, db, consulta)
    .then((resultado) => {
    if (resultado == null) {
        console.log('No encontrado');
    }
    else {
        console.log('Iniciando actualizacion...');
        updateMongo(resultado);
    }
}).catch((err) => {
    console.error('Error**:' + err);
});
function updateMongo(listadoNomivac) {
    MongoClient.connect(url, function (err, dbMongo) {
        if (err) {
            console.log('Error conectando a mongoClient', err);
            dbMongo.close();
        }
        listadoNomivac.forEach((os) => {
            console.log("Parametroo ", os);
            dbMongo.collection(coleccion).save(function (err2, result) {
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
//# sourceMappingURL=testNomivacImporter.js.map