const path = require('path');

// Load ORM
const Sequelize = require('sequelize');


// To use SQLite data base:
//    DATABASE_URL = sqlite:quiz.sqlite
// To use  Heroku Postgres data base:
//    DATABASE_URL = postgres://user:passwd@host:port/database

const url = process.env.DATABASE_URL || "sqlite:quiz.sqlite";

//esta sentencia de atras sirve para adaptar la base de datos a heroku o no dependiendo de si estamos en heroku o en nuestro puesto local

const sequelize = new Sequelize(url);

// Import the definition of the Quiz Table from quiz.js
sequelize.import(path.join(__dirname, 'quiz'));

// Import the definition of the Tips Table from tip.js
//Se importa el modelo para tener esta estructura disponible
sequelize.import(path.join(__dirname,'tip'));

// Import the definition of the Users Table from user.js
sequelize.import(path.join(__dirname,'user'));

// Session
sequelize.import(path.join(__dirname,'session'));


// Relation between models
//hay que definir una relacion ya que los tips estan relacionados a algun tips


const {quiz, tip, user} = sequelize.models;

//tip belongs to quiz ya que un tip esta asociado a un solo quiz
//mientras que un quiz puede tener varios tips
//en la tabla de tips habra una columna en la que se indica a que quiz esta asociado ese tip

tip.belongsTo(quiz);
quiz.hasMany(tip);

// Relation 1-to-N between User and Quiz:
//un usuario puede tener muchos quizzes y esto se gestiona a traves de una columna en la tabla de quizzes  (authorid)
//la columna va a tener como nombre authorId
//cada quiz solo tiene un author

user.hasMany(quiz, {foreignKey: 'authorId'});
quiz.belongsTo(user, {as: 'author', foreignKey: 'authorId'});

// Relation 1-to-N between User and Tip:
user.hasMany(tip, {foreignKey: 'authorId'});
tip.belongsTo(user, {as: 'author', foreignKey: 'authorId'});


module.exports = sequelize;
