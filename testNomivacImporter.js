"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var configPrivate = require("./config.private");
var nomivacImporter_1 = require("./nomivacImporter");
var es6_promise_1 = require("es6-promise");
var log = require("./logger");
// const errorLog = require('./logger').errorlog;
// const successlog = require('./logger').successlog;
// Require
var MongoClient = require('mongodb').MongoClient;
var url = configPrivate.configPrivate.mongoDB.host;
var coleccion = configPrivate.configPrivate.mongoDB.collection;
var usuario = configPrivate.configPrivate.auth.user;
var pass = configPrivate.configPrivate.auth.password;
var server = configPrivate.configPrivate.serverSql.server;
var db = configPrivate.configPrivate.serverSql.database;
var servicio = new nomivacImporter_1.servicioMssql();
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
                if (data.length > 0) {
                    parametro = " id > " + data[0].idvacuna + " and";
                    // parametro = " where idCurso > " + data[0].idCurso;
                }
                consulta = "SELECT top 5000 ID AS idvacuna, CONVERT(varchar(8), NroDocumento)  AS documento, Apellido AS apellido, Nombre AS nombre, FechaNacimiento AS fechaNacimiento, CASE Sexo WHEN 'M' THEN 'masculino' ELSE 'femenino' END AS sexo  , Vacuna AS vacuna, Dosis AS dosis, FechaAplicacion AS fechaAplicacion, Establecimiento AS efector FROM dbo.Nomivac WHERE " + parametro + " CodigoAplicacion IS NOT null ORDER BY ID";
                // consulta = "select top 1000 * from Cursos " + parametro;
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
        if (resultado.length === 0) {
            return;
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
    var _this = this;
    var x = 0;
    var requests = listadoNomivac.reduce(function (promiseChain, item) {
        return promiseChain.then(function () { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new es6_promise_1.Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    log.successLogger.info("N\u00B0 " + x);
                                    x++;
                                    return [4 /*yield*/, asyncFunction(item, resolve)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        }); });
    }, es6_promise_1.Promise.resolve());
    requests.then(function () { return callback(x); });
}
function asyncFunction(listado, cb) {
    setTimeout(function () {
        MongoClient.connect(url, function (err, dbMongo) {
            dbMongo.collection(coleccion).save(listado, function (err2, result) {
                if (err2) {
                    console.log('Error save:', err2);
                    log.errorLogger.error("Error Message : " + err2);
                    dbMongo.close();
                }
                else {
                    log.successLogger.info("Vacuna insertada: " + listado.idvacuna);
                    dbMongo.close();
                }
            });
        });
        cb();
    }, 100);
}
function callback(x) {
    log.successLogger.info("Se insertaron: " + x + " registros");
    // new importer().getLastInsertedInMongo();
}
exports["default"] = new importer().getLastInsertedInMongo();
