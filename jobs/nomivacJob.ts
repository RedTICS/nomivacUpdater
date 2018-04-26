import * as TestNomivacImporter from './../testNomivacImporter';

function run() {
    //TestNomivacImporter.getLastInsertedInMongo();
    let ultimoId;
    TestNomivacImporter.getLastInsertedInMongo(/*true*/);
}

export = run;
