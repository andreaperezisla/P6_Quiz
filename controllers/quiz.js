const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const {models} = require("../models");

const paginate = require('../helpers/paginate').paginate;

// Autoload the quiz with id equals to :quizId

//HAY UN MIDDLEWARE PARA CADA UNA DE LAS PRIMITIVAS QUE PUEDEN LLEGAR A TRAVES DE  LA INTERFAZ, DE LAS SOLICITUDES QUE VAN A LLEGAR
//index, show, .. tienen estructura de middleware con req y res como parametrs

// en req se pueden acceder a parametros a traves de req.params o req.body o req.query
// dependiendo de donde se encuentren los datos a los que queremos acceder


//Autoload el quiz asociado a :quizId
exports.load = (req, res, next, quizId) => {
        //con el include, cada vez que se cargue un quiz, se tiene que cargar todos los tips asociados a ese quiz
        //hay que cargar la relacion entre el quiz y el autor que esta como author
    models.quiz.findById(quizId, {
        include: [
            {model: models.tip,  //aqui cargan los tips asociados al quiz cargado
                include: [{model: models.user, as: 'author'}]
            },
            {model: models.user, as: 'author'}
        ]
    })
    .then(quiz => {
        if (quiz) {
            req.quiz = quiz;
            next();
        } else {
            throw new Error('There is no quiz with id=' + quizId);
        }
    })
    .catch(error => next(error));
};


// MW that allows actions only if the user logged in is admin or is the author of the quiz.
exports.adminOrAuthorRequired = (req, res, next) => {

    const isAdmin  = !!req.session.user.isAdmin;
    const isAuthor = req.quiz.authorId === req.session.user.id;

    if (isAdmin || isAuthor) {
        next();
    } else {
        console.log('Prohibited operation: The logged in user is not the author of the quiz, nor an administrator.');
        res.send(403);
    }
};


// GET /quizzes
exports.index = (req, res, next) => {
        //definimos countOptions, aqui meteremos el identificador de usuario
    let countOptions = {
        where: {}
    };

    let title = "Questions";

    // Search:
    //estos comandos sirven para poder buscar en la interfaz

    const search = req.query.search || '';
    if (search) {
        const search_like = "%" + search.replace(/ +/g,"%") + "%";

        countOptions.where.question = { [Op.like]: search_like };
    }

    // If there exists "req.user", then only the quizzes of that user are shown
    if (req.user) { //este user solo existira si se ha invocado a la primitiva asociada a las questions of pepe (por ejemplo)
        countOptions.where.authorId = req.user.id;
        title = "Questions of " + req.user.username;
    }

    models.quiz.count(countOptions)
    .then(count => {

        // Pagination:
        //aqui configuramos la paginacion para nuestra interfaz

        const items_per_page = 10;

        // The page to show is given in the query
        const pageno = parseInt(req.query.pageno) || 1;

        // Create a String with the HTMl used to render the pagination buttons.
        // This String is added to a local variable of res, which is used into the application layout file.
        res.locals.paginate_control = paginate(count, items_per_page, pageno, req.url);

        const findOptions = {
            ...countOptions,
            offset: items_per_page * (pageno - 1),
            limit: items_per_page,
            include: [{model: models.user, as: 'author'}]
        };

        return models.quiz.findAll(findOptions);
    })
    .then(quizzes => {    //aqui se renderiza la vista y se pasn una serie de parametros, entre ellos, quizzes, que se introduce en un bucle for en la vista para mostrar todos los quizzes que hay en la base de datos
        res.render('quizzes/index.ejs', {
            quizzes, 
            search,     //todos los elementos que se muestren tienen que cumplir la condicion                     
            title
        });
    })
    .catch(error => next(error));
};


// GET /quizzes/:quizId
//aqui ya no se tendra que buscar en la base de datos gracias a LOAD
exports.show = (req, res, next) => {

    const {quiz} = req;
    //se asigna req a la variable destructurada quiz
    //al render se le pasa como parametro el objeto quiz que en la vista de show se puede ver que se utiliza para mostrar la pregunta y respuesta asociada a ese quiz
    res.render('quizzes/show', {quiz});
};


// GET /quizzes/new

//aqui se crea una constante quiz y luego se renderiza la vista new pasandole los campos vacios porque ahi se meterán los valores que hemos metido nosotros en el formulario add
exports.new = (req, res, next) => {

    const quiz = {
        question: "", 
        answer: ""
    };

    res.render('quizzes/new', {quiz});
};

// POST /quizzes/create
//Crea un nuevo quiz en la base de datos al darle a SAVE en ADD QUESTION

exports.create = (req, res, next) => {

    const {question, answer} = req.body;

    const authorId = req.session.user && req.session.user.id || 0;

    const quiz = models.quiz.build({
        question,
        answer,
        authorId
    });

    // Saves only the fields question and answer into the DDBB
    quiz.save({fields: ["question", "answer", "authorId"]})
    .then(quiz => {
        req.flash('success', 'Quiz created successfully.');
        res.redirect('/quizzes/' + quiz.id);
    })
    .catch(Sequelize.ValidationError, error => {
        req.flash('error', 'There are errors in the form:');
        error.errors.forEach(({message}) => req.flash('error', message));
        res.render('quizzes/new', {quiz});
    })
    .catch(error => {
        req.flash('error', 'Error creating a new Quiz: ' + error.message);
        next(error);
    });
};


// GET /quizzes/:quizId/edit
//renderiza el objeto de edicion
//AQUI YA NO SE BUSCA PORQUE YA SE HA HECHO EN LOAD Y EN TODOS LOS METODOS PARECIDOS A ESTE

exports.edit = (req, res, next) => {

    const {quiz} = req;

    res.render('quizzes/edit', {quiz});
};


// PUT /quizzes/:quizId
//si existe el quiz hacemos el res.redirect

exports.update = (req, res, next) => {

    const {quiz, body} = req;

    quiz.question = body.question;
    quiz.answer = body.answer;

    quiz.save({fields: ["question", "answer"]})
    .then(quiz => {
        req.flash('success', 'Quiz edited successfully.');
        res.redirect('/quizzes/' + quiz.id);
    })
    .catch(Sequelize.ValidationError, error => {
        req.flash('error', 'There are errors in the form:');
        error.errors.forEach(({message}) => req.flash('error', message));
        res.render('quizzes/edit', {quiz});
    })
    .catch(error => {
        req.flash('error', 'Error editing the Quiz: ' + error.message);
        next(error);
    });
};


// DELETE /quizzes/:quizId

exports.destroy = (req, res, next) => {

    req.quiz.destroy()
    .then(() => {
        req.flash('success', 'Quiz deleted successfully.');
        res.redirect('/goback');
    })
    .catch(error => {
        req.flash('error', 'Error deleting the Quiz: ' + error.message);
        next(error);
    });
};


// GET /quizzes/:quizId/play
//TAMBIEN SE SIMPLIFICA GRACIAS A LOAD
exports.play = (req, res, next) => {

    const {quiz, query} = req;
     //LAS COMILLAS DE AQUI ABAJO SIGNIFICA QUE SI NO EXISTE SE INTRODUCE UN STRING VACIO COMO PARAMETRO
    const answer = query.answer || '';

    res.render('quizzes/play', {
        quiz,
        answer
    });
};


// GET /quizzes/:quizId/check
exports.check = (req, res, next) => {

    const {quiz, query} = req;

    const answer = query.answer || "";
    const result = answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim();

    res.render('quizzes/result', {
        quiz,
        result,
        answer
    });
};


exports.randomplay = (req,res,next) =>{

    if(req.session.resolved === undefined){
        req.session.resolved = [];
    };
    Sequelize.Promise.resolve().then(() =>{
        const whereOpt = {"id":{[Sequelize.Op.notIn]:req.session.resolved}};
        return models.quiz.count({where: whereOpt}).then(count => {
            let ran = Math.floor(Math.random()*count);
            return models.quiz.findAll({
                offset:ran,
                limit:1,
                where: whereOpt
            }).then(quizzes =>{
                return quizzes[0];
            });
        }).catch(error => {
            req.flash('error', 'Error deleting the Quiz: ' + error.message);
            next(error);
        });
    }).then(quiz =>{
        let score = req.session.resolved.length;
        if(quiz ===undefined){
            delete req.session.resolved;
            res.render('quizzes/random_nomore', {score});

        }else{
            res.render('quizzes/random_play', {
                quiz, score
            });
        }

    });
};


exports.randomcheck = (req, res,next) => {

    if(req.session.randomPlay == undefined ) {
        req.session.randomPlay = [];
    }
    const player_answer =  req.query.answer || "";
    const quiz_Answer = req.quiz.answer;
    var score = req.session.randomPlay.length;
    var result = player_answer.toLowerCase().trim() === quiz_Answer.toLowerCase().trim();


    if(result){
        req.session.randomPlay.push(req.quiz.id) // Añade elementos al final del array.
        score = req.session.randomPlay.length;
    }

    res.render('quizzes/random_result', {
        score: score,
        answer: player_answer,
        result: result
    });

};


