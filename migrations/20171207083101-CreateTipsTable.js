'use strict';

//como hemos creado un nuevo modelo, tenemos que crear la migracion y el seeder asociado si es que existe (seeder en este caso no)

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable(
            'tips',
            {
                id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true,
                    unique: true
                },
                quizId: {           //la clave externa de la relacion que va a identificar el quiz al que esta asociado este tip
                    type: Sequelize.INTEGER
                },
                text: {
                    type: Sequelize.STRING,
                    validate: {notEmpty: {msg: "Tip text must not be empty."}}
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

    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('tips');
    }
};
