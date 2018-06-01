const Sequelize = require("sequelize");
const {models} = require("../models");
const url = require('url');


// This variable contains the maximum inactivity time allowed without 
// making requests.
// If the logged user does not make any new request during this time, 
// then the user's session will be closed.
// The value is in milliseconds.
// 5 minutes.
const maxIdleTime = 5*60*1000;

//la sesion de login se construye sobre la sesion express que se maneja con la cookie sid, es la que identifica cada usuario
//cada usuario tiene un sid unico, por eso sabe que usuario esta interaccionando con la aplicacion



//
// Middleware used to destroy the user's session if the inactivity time
// has been exceeded.
//

//se expira la sesion-de-login cuando pasa un tiempo determinado
//borra la sesion con req.session.user delete

exports.deleteExpiredUserSession = (req, res, next) => {

    if (req.session.user ) { // There exista user's session
        if ( req.session.user.expires < Date.now() ) { // Expired
            delete req.session.user; // Logout
            req.flash('info', 'User session has expired.');
        } else { // Not expired. Reset value.
            req.session.user.expires = Date.now() + maxIdleTime;
        }
    }
    // Continue with the request
    next();
};


// Middleware: Login required.
//
// If the user is logged in previously then there will exists
// the req.session.user object, so I continue with the others
// middlewares or routes.
// If req.session.user does not exist, then nobody is logged,
// so I redirect to the login screen.
// I keep on redir which is my url to automatically return to
// that url after login; but if redir already exists then
// this value is maintained.
//
exports.loginRequired = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/session?redir=' + (req.param('redir') || req.url));
    }
};



// MW that allows to pass only if the logged useer in is admin.
exports.adminRequired = (req, res, next) => {

    const isAdmin = !!req.session.user.isAdmin;

    if (isAdmin) {
        next();
    } else {
        console.log('Prohibited route: the logged in user is not an administrator.');
        res.send(403);    
    }
};

// MW that allows to pass only if the logged in user is:
// - admin
// - or is the user to be managed.
exports.adminOrMyselfRequired = (req, res, next) => {

    const isAdmin  = !!req.session.user.isAdmin;
    const isMyself = req.user.id === req.session.user.id;

    if (isAdmin || isMyself) {
        next();
    } else {
        console.log('Prohibited route: it is not the logged in user, nor an administrator.');
        res.send(403);    
    }
};

// MW that allows to pass only if the logged in user is:
// - admin
// - and is not the user to manage.
exports.adminAndNotMyselfRequired = function(req, res, next){

    const isAdmin   = req.session.user.isAdmin;
    const isAnother = req.user.id !== req.session.user.id;

    if (isAdmin && isAnother) {
        next();
    } else {
        console.log('Prohibited route: the user is logged or is not an administrator.');
        res.send(403);    }
};


/*
 * User authentication: Checks that the user is registered.
 *
 * Return a Promise that searches a user with the given login, and checks that 
 * the password is correct.
 * If the authentication is correct, then the promise is satisfied and returns
 * an object with the User.
 * If the authentication fails, then the promise is also satisfied, but it
 * returns null.
 */
const authenticate = (login, password) => {

    return models.user.findOne({where: {username: login}})
    .then(user => {
        if (user && user.verifyPassword(password)) {
            return user;
        } else {
            return null;
        }
    });
};



// GET /session   -- Login form
exports.new = (req, res, next) => {

    //REDIR------IMPORTANTE
    //ES UN PARAMETRO QUE SIRVE PARA VOLVER A LA PAGINA ANTERIOR AL LOG IN,
    //GUARDA LA RUTA DE LA PAGINA DESDE DONDE SE INICIO LA AUTENTICACION.
    // SE ENVIA COMO PARAMETRO OCULTO



    // Page to go/show after login:
    let redir = req.query.redir || url.parse(req.headers.referer || "/").path;

        //REFERER ES UN CAMPO ESTANDAR DE LA CABECERA QUE TRAE LA RUTA DE LA PRIMITIVA QUE NOS ACABA DE LLEGAR (ES A LA QUE TENEMOS QUE VOLVER)

    // Do not go here, i.e. do not shown the login form again.
    if (redir === '/session') {  //PARA NO VOLVER A LA PAGINA LOGIN UNA Y OTRA VEZ
        redir = "/";
    }

    res.render('session/new', {redir});
};


// POST /session   -- Create the session if the user authenticates successfully
exports.create = (req, res, next) => {

    const redir = req.body.redir || '/'

    const login     = req.body.login;
    const password  = req.body.password;

    authenticate(login, password)
    .then(user => {
        if (user) {
            // Create req.session.user and save id and username fields.
            // The existence of req.session.user indicates that the session exists.
            // I also save the moment when the session will expire due to inactivity.
            req.session.user = {
                id: user.id,
                username: user.username,
                isAdmin: user.isAdmin,
                expires: Date.now() + maxIdleTime
            };

            res.redirect(redir); 
        } else {
            req.flash('error', 'Authentication has failed. Retry it again.');
            res.render('session/new', {redir});
        }
    })
    .catch(error => {
        req.flash('error', 'An error has occurred: ' + error);
        next(error);
    });
};


// DELETE /session   --  Close the session
exports.destroy = (req, res, next) => {

    delete req.session.user;

    res.redirect("/session"); // redirect to login gage
};
