
const crypt = require('../helpers/crypt');

// Definition of the User model:

//Para usuarios se necesita una tabla "especial"
//salt es un string que ayuda a aleatorizar una contraseña y proteger mejor los datos

//en password, definimos un string pero lo vamos a encriptar
//la funcion set nos permite ejecutar una funcion en el momento de definir el campo pasword
//este funcion fijara el contenido de este campo
//a salt le asigna un numero aleatorio, genera un numero grande que convierte en un string con el +""
//y despues encripta el password con el this.salt

module.exports = function (sequelize, DataTypes) {
    const User = sequelize.define('user', {
        username: {
            type: DataTypes.STRING,
            unique: true,
            validate: {notEmpty: {msg: "Username must not be empty."}}
        },
        password: {
            type: DataTypes.STRING,
            validate: {notEmpty: {msg: "Password must not be empty."}},
            set(password) {
                // Random String used as salt.
                this.salt = Math.round((new Date().valueOf() * Math.random())) + '';
                this.setDataValue('password', crypt.encryptPassword(password, this.salt));
            }
        },
        salt: {
            type: DataTypes.STRING
        },
        isAdmin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    });
        //esta funcion es un metodo accesible sobre los usuarios que comprueba si el password introducido es el correcto

    User.prototype.verifyPassword = function (password) {
        return crypt.encryptPassword(password, this.salt) === this.password;
    };

    return User;
};

