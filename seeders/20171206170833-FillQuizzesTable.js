'use strict';


//los seeders son los ficheros que indican como se deben inicializar las tablas de datos
//se crean desde terminal /node_modules .... seed:create --name FillQuizzesTable , por ejemplo, en este caso
//tambien tienen marca de tiempo que marca el orden
//en up rellenamos la parte que mete la semilla, los primeros datos, en la tabla de datos
//lo unico que no damos es el id
//la funcion down es un borrado en bloque de la base de datos


module.exports = {
    up(queryInterface, Sequelize) {

        return queryInterface.bulkInsert('quizzes', [
            {
                question: 'Capital of Italy',
                answer: 'Rome',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                question: 'Capital of Portugal',
                answer: 'Lisbon',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                question: 'Capital of Spain',
                answer: 'Madrid',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                question: 'Capital of France',
                answer: 'Paris',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    },

    down(queryInterface, Sequelize) {

        return queryInterface.bulkDelete('quizzes', null, {});
    }
};
