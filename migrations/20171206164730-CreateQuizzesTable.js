'use strict';


//las migraciones permiten una gestion incremental y reversible de cambios en los modelos de datos utilizados
//en sequelize es sequelize-cli
//se generan con /node_modules ... migration:create --name CreateQuizzesTable , por ejemplo
//el archivo tiene la fecha de creacion en el nombre, asi se harán por orden de creacion las migraciones
//funcion up-- introduce el cambio que se produce en ese paso de diseño, como este es el primero, se crea la tabla de quizzes y la tabla de users
//funcion down-- desahce el cambio introducido, borraria la tabla de las definiciones


module.exports = {
    up(queryInterface, Sequelize) {
        return queryInterface.createTable(
            'quizzes',
            {
                id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true,
                    unique: true
                },
                question: {
                    type: Sequelize.STRING,
                    validate: {notEmpty: {msg: "Question must not be empty."}}
                },
                answer: {
                    type: Sequelize.STRING,
                    validate: {notEmpty: {msg: "Answer must not be empty."}}
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false
                }
            },
            {
                sync: {force: true}
            }
        );
    },
    down(queryInterface, Sequelize) {
        return queryInterface.dropTable('quizzes');
    }
};
