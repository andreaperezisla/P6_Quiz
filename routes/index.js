const express = require('express');
const router = express.Router();

const quizController = require('../controllers/quiz');
const tipController = require('../controllers/tip');
const userController = require('../controllers/user');
const sessionController = require('../controllers/session');

//aqui se importan los correspondientes controladores

//-----------------------------------------------------------

// autologout
router.all('*',sessionController.deleteExpiredUserSession);

//-----------------------------------------------------------

// History: Restoration routes.

// Redirection to the saved restoration route.
function redirectBack(req, res, next) {
    const url = req.session.backURL || "/";
    delete req.session.backURL;
    res.redirect(url);
}

router.get('/goback', redirectBack);

// Save the route that will be the current restoration route.
function saveBack(req, res, next) {
    req.session.backURL = req.url;
    next();
}

// Restoration routes are GET routes that do not end in:
//   /new, /edit, /play, /check, /session, or /:id.
router.get([
    '/',
    '/author',
    '/users',
    '/users/:id(\\d+)/quizzes',
    '/quizzes'], saveBack);

//-----------------------------------------------------------

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index');
});

// Author page.
router.get('/author', (req, res, next) => {
    res.render('author');
});


// Autoload for routes using :quizId
//el primer nombre es el nombre del parametro que va en la ruta, el segundo el middleware que vamos a instalar
//Esto permite que todos los metodos podran usar quizId para buscar
//todos los que lleven el parametro next no tendrán que buscar otra vez en la base de datos

//hay que instalar la funcion load de usuarios para qeu cuando una de las rutas lleve el identificador de usuario, se nos precargue y lo tengamos disponible

router.param('quizId', quizController.load);
router.param('userId', userController.load);
router.param('tipId',  tipController.load);


// Routes for the resource /session
router.get('/session',    sessionController.new);     // login form
router.post('/session',   sessionController.create);  // create sesion
router.delete('/session', sessionController.destroy); // close sesion


// Routes for the resource /users
//tambien hay que crear las siete primitivas nuevas asociadas a los users

router.get('/users',
    sessionController.loginRequired,
	userController.index);
router.get('/users/:userId(\\d+)',
    sessionController.loginRequired,
	userController.show);
router.get('/users/new',
	userController.new);
router.post('/users',
	userController.create);
router.get('/users/:userId(\\d+)/edit',
    sessionController.loginRequired,
    sessionController.adminOrMyselfRequired,
	userController.edit);
router.put('/users/:userId(\\d+)',
    sessionController.loginRequired,
    sessionController.adminOrMyselfRequired,
	userController.update);
router.delete('/users/:userId(\\d+)',
    sessionController.loginRequired,
    sessionController.adminOrMyselfRequired,
	userController.destroy);

//se relaciona un usuario con los quizzes de los que es autor
router.get('/users/:userId(\\d+)/quizzes',
    sessionController.loginRequired,
    quizController.index);


// Routes for the resource /quizzes
router.get('/quizzes',
	quizController.index);
router.get('/quizzes/:quizId(\\d+)',
	quizController.show);
router.get('/quizzes/new',
    sessionController.loginRequired,
	quizController.new);
router.post('/quizzes',
    sessionController.loginRequired,
	quizController.create);

//en create solo se pone /quizes porque queremos crear un recursos en esa direccion
//se enviara al servidor la pregunta que se haya añadido en la ventana Add Question
//el servidor responderá con una redireccion que obligan al cliente a redireccionar
//es decir, a una nueva solicitud ya de tipo get que es el que le muestra la vista que queremos ver
// si por ejemplo se ha creado la pregunta 6, se verá la vista de show question con la pregunta que se acaba de añadir


//los formularios post generan el metodo de la primitiva que va a ir al servidor
//Esta solicitud se enviara al pulsar el boton SAVE


router.get('/quizzes/:quizId(\\d+)/edit',
    sessionController.loginRequired,
    quizController.adminOrAuthorRequired,
	quizController.edit);
//aqui en edit se mete un id concreto porque queremos editar un determinado

router.put('/quizzes/:quizId(\\d+)',
    sessionController.loginRequired,
    quizController.adminOrAuthorRequired,
	quizController.update);
router.delete('/quizzes/:quizId(\\d+)',
    sessionController.loginRequired,
    quizController.adminOrAuthorRequired,
	quizController.destroy);

router.get('/quizzes/:quizId(\\d+)/tips/:tipId(\\d+)/edit',
    sessionController.loginRequired,
    tipController.adminOrAuthorRequired,
    tipController.edit);

router.put('/quizzes/:quizId(\\d+)/tips/:tipId(\\d+)/update',
    sessionController.loginRequired,
    tipController.adminOrAuthorRequired,
    tipController.update);

router.get('/quizzes/:quizId(\\d+)/play',  quizController.play);
router.get('/quizzes/:quizId(\\d+)/check', quizController.check);

router.get('/quizzes/:randomplay', quizController.randomplay);
router.get('/quizzes/:randomcheck/:quizId(\\d+)', quizController.randomcheck);

//dos primitivas de tipo get, consultamos informacion para play y para check
//get tiene la ruta, el identificador del quiz y usa la funcion play

//PUT Y DELETE UTILIZAN METHOD OVERRIDE, necesario porque HTML solo permite enviar solicitudes GET y POST
//_method=DELETE envia una solicitud de DELETE
//el method-override se instala como todos los demas y se mete en package.json

//nombre de la accion del controlador --> quizController.play
//POST, PUT Y DELETE NUNCA TIENEN UNA VISTA ASOCIADA

//para tips solo se necesita un post ya que no va a tener ninguna vista asociada y se va a usar para actualizar algun tip en caso de que lo necesitemos

router.post('/quizzes/:quizId(\\d+)/tips',
    sessionController.loginRequired,
    tipController.create);
router.put('/quizzes/:quizId(\\d+)/tips/:tipId(\\d+)/accept',
    sessionController.loginRequired,
    quizController.adminOrAuthorRequired,
    tipController.accept);
router.delete('/quizzes/:quizId(\\d+)/tips/:tipId(\\d+)',
    sessionController.loginRequired,
    quizController.adminOrAuthorRequired,
    tipController.destroy);


module.exports = router;
