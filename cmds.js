const model =require('./model');
const {log, biglog, errorlog, colorize} =require("./out");

exports.helpCmd = rl => {
    log('Commandos:');
    log(' h|help - Muestra esta ayuda.');
    log('list - Listar los quizzes existentes');
    log('show <id> - Muestra la pregunta y la respuesta el quiz indicado.');
    log(' add - Añadir un nuevo quiz interactivamente.');
    log(' delete <id> - Borrar el quiz indicado.');
    log('edit <id> - Editar el quiz indicado. ');
    log('test <id> - Probar el quiz indicado.');
    log('p|play - Jugar a preguntar aleatoriamente todos los quizzes.');
    log('credits - Créditos.');
    log('q|quit - Salir del programa.');
    rl.prompt();
};

exports.listCmd = rl =>{
    model.getAll().forEach((quiz, id) => {
        log(`[${colorize(id, 'magenta')}]: ${quiz.question}`);
    });
    rl.prompt();
};

exports.showCmd = (rl,id) =>{
    if(typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
    } else{
        try{
            const quiz = model.getByIndex(id);
            log(`[${colorize(id,'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
        } catch(error){
            errorlog(error.message);
        }
    }
    rl.prompt();
};

exports.addCmd = rl =>{
    rl.question(colorize('Introduzca una pregunta: ', 'red'), question => {
        rl.question(colorize('Introduzca la respuesta', 'red'), answer => {
            model.add(question,answer);
            log(` ${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>', 'magenta')} ${answer}`);
            rl.prompt();
        });
    });
};

exports.deleteCmd = (rl,id) =>{
    if(typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
    } else{
        try{
            model.deleteByIndex(id);
        } catch(error){
            errorlog(error.message);
        }
    }

    rl.prompt();
};

exports.editCmd = (rl,id) =>{
    if(typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    } else{
        try{
            const quiz = model.getByIndex(id);
            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0);
            rl.question(colorize('Introduzca una pregunta:', 'red'), question =>{
                process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)}, 0);
                rl.question(colorize('Introduzca la respuesta', 'red'), answer=>{
                    model.update(id, question, answer);
                    log(`Se ha cambiado el quiz ${colorize(id,'magenta')} por: ${question} ${colorize('=>', 'magenta')} ${answer}`);
                    rl.prompt();
                });
            });
        } catch(error){
            errorlog(error.message);
            rl.prompt();
        }
    }
};

exports.testCmd = (rl,id) =>{
    if(typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    }else{
        try{
           const quiz = model.getByIndex(id);
            rl.question(colorize(`${quiz.question}? =>`, 'red'), resp => {
                let rightAnswer = RegExp(quiz.answer, 'i');
                const theAnswers = resp.match(rightAnswer);
                if(theAnswers == null){
                    biglog(`INCORRECTO`, 'red');
                }else if((theAnswers[0].replace(rightAnswer,quiz.answer).toLowerCase().trim()) === (quiz.answer.toLowerCase().trim())){
                   log(`Su respuesta es:`) ;
                   biglog('CORRECTO' , 'green');

                }else{
                   log(`Su respuesta es:`) ;
                   biglog('INCORRECTO' , 'red');

            }
                rl.prompt();
            });


        }catch(error){
            errorlog(error.message);
            rl.prompt();
        }

        }


};

exports.playCmd = rl => {
    let score = 0;
    let toBeResolved = [];
    model.getAll().forEach((quiz, id) => {
        toBeResolved.push(id);
    });
    const playOne = () => {
        if (toBeResolved.length === 0) {
            log(`No hay preguntas.`);
            log(`Número de aciertos:`);
            biglog(score);
            rl.prompt();
        } else {
            let idRandom = toBeResolved[Math.floor(Math.random() * toBeResolved.length)];
            const quiz = model.getByIndex(idRandom);
            toBeResolved.splice(toBeResolved[Math.floor(Math.random() * toBeResolved.length)], 1);
            rl.question(colorize(`${quiz.question}? =>`, 'red'), resp => {
                let rightAnswer = RegExp(quiz.answer, 'i');
                const theAnswers = resp.match(rightAnswer);
                if (theAnswers == null) {
                    log(`Fin de examen.`);
                    log(`Aciertos:`);
                    biglog(score);
                } else if ((theAnswers[0].replace(rightAnswer, quiz.answer).toLowerCase().trim()) === (quiz.answer.toLowerCase().trim())) {
                    
                    log(`Llevas ${score + 1} aciertos`);
                    playOne();
                } else {
                    log(`Fin del examen.`);
                    log(`Número de aciertos:`);
                    biglog(`${score}`);
                    rl.prompt();
                }
            });
        }
    };
    playOne();
};

exports.creditsCmd = rl =>{
    log('Autor de la practica');
    log('MARIA', 'green');
    rl.prompt();
};

exports.quitCmd = rl =>{
    rl.close();
};
