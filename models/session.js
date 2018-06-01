// Definition of the Session model:
//aqui se define como se van a guardar las variables relacionadas con la sesion
//expires es la fecha y hora en la que experia una session
//data--> campo de datos de la sesion
//cookies solo tienen 4K de capacidad, se intenta mandar lo minimo
//de esta forma, se genera menos trafico y una respuesta más rápida


module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'session',
        {
            sid: {
                type: DataTypes.STRING,
                primaryKey: true
            },
            expires: {
                type: DataTypes.DATE
            },
            data: {
                type: DataTypes.STRING(50000)
            }
        });
};
