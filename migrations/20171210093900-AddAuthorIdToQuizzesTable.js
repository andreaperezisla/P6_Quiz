'use strict';

//para crear la columna, tenemos que crear una migracion que no cree una tabla completa, solo una columna
//en la funcion up, hacemos addColumn y en la funcion down hacemos removeColumn


module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn(
            'quizzes',
            'authorId',
            {type: Sequelize.INTEGER}
        );
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('quizzes', 'authorId');
    }
};
