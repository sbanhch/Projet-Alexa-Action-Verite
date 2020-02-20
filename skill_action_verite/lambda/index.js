const Alexa = require('ask-sdk-core');
const sa = require('superagent');

//url api
const url = 'http://34.238.113.165/';

//appel api
const apiCallGetPut = async (type, param) => {
    console.log('dans fonction apiCallGetPut');
    if (type === 'GET'){
        const reqGet = await sa.get(url+param)
            .timeout({
                response: 5000,
                deadline: 60000,
            })
            .then(res => {
                console.log(res);
                return res;
            }, err => {
                if (err.timeout) {
                    console.log('TIMEOUT ERROR');
                    return 'ERROR';
                } else {
                    console.log('ERROR');
                    return 'ERROR';
                }
            });
        console.log('res req');
        console.log(reqGet);
        return reqGet;
    } else if (type === 'PUT'){
        const reqPut = await sa.put(url+param)
            .timeout({
                response: 5000,  // Wait 5 seconds for the server to start sending,
                deadline: 60000, // but allow 1 minute for the file to finish loading.
            })
            .then(res => {
                console.log(res);
                return res;
            }, err => {
                if (err.timeout) {
                    console.log('TIMEOUT ERROR');
                    return 'ERROR';
                } else {
                    console.log('ERROR');
                    return 'ERROR';
                }
            });
        console.log('res req');
        console.log(reqPut);
        return reqPut;
    }
};

//mise en forme du classement
function affichage (tab,x) {
    let text = "";
    for(let i = 0; i<x; i++) {
        var j = i + 1;
        text = text + tab[i].name + " est numéro " +  j + " avec " + tab[i].points + " points.\n";
    }
    return text;
}

function resetPoints(tab,x) {
    for(let i=1; i<=x; i++) {
        tab[i].points = 0;
    }
}

//Intent de départ
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput) {
        console.log("Debut skill");
        //faire le 1er > si erreur arreter > sinon faire 2ieme > si erreur arreter > sinon continuer
        const resetTru = await apiCallGetPut('PUT', 'verite/reset');
        console.log(resetTru);
        if (resetTru === 'ERROR'){
            console.log('dans erreur tru');
            const speakOutput = 'Erreur sur le serveur. Il est impossible de jouer. Vraiment déso, je te dirai bien d\'appeler le service client pour te plaindre mais y en n\'a pas !';
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .withShouldEndSession(true)
                .getResponse();
        }
        const resetAct = await apiCallGetPut('PUT', 'action/reset');
        console.log(resetAct);
        if (resetAct === 'ERROR'){
            console.log('dans erreur act');
            const speakOutput = 'Erreur sur le serveur. Il est impossible de jouer. Vraiment déso, je te dirai bien d\'appeler le service client pour te plaindre mais y en n\'a pas !';
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .withShouldEndSession(true)
                .getResponse();
        }
        console.log("skill apres reset");
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.nbPlayer = null;
        sessionAttributes.nbRound = null;
        sessionAttributes.actVeritStocked = null;
        sessionAttributes.level = 1;
        sessionAttributes.playingRound = 1;
        sessionAttributes.playingPlayer = 1;
        sessionAttributes.countPlayer = 1;
        sessionAttributes.playersTab = {};
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        
        const speakOutput = 'Bonjour et bienvenue sur Action ou Vérité. Dites "commencer" pour commencer une nouvelle partie. Les règles sont disponible en me disant "Donne moi les règles".';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
//Pour enoncer les regles
const RulesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RulesIntent'
    },
    handle(handlerInput) {
        let speakOutput = 'Les règles sont les suivantes : le joueur choisit entre Action et Vérité. Si il choisit Vérité il doit alors répondre de façon sincère à une question posée. Sinon s\'il choisit Action, une action est donnée et le joueur doit l\'accomplir. Le joueur obtient 1 point en cas de succès 0 sinon. Bonne chance !';
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        let tabB = Object.values(sessionAttributes.playersTab);
        
        
        // choix de l'intent en fonction de si le joueur demande le classement avant/après son action/vérité ou la validation de l'initialisation
        let directive = null;
        let currentActTruth = "";
        // Si action/vérité stocké dans sessionAttributes
        if(sessionAttributes.actVeritStocked !== null) {
            directive = 'validationIntent';
            currentActTruth = sessionAttributes.actVeritStocked;
            console.log("Apres regle va dans validation intent");
        }
        else {
            directive = 'ActionIntent';
            currentActTruth = "";
            console.log("Apres regle va dans action intent");
        }
        
        //si l'initialisation n'est pas encore faite, on appelle 'DialogIntent'
        if(sessionAttributes.nbPlayer === null || sessionAttributes.nbRound === null || sessionAttributes.level === null) {
            directive = 'DialogIntent';
            console.log("Apres regle va dans dialog intent");
        }
        //si l'initialisation est faite mais les noms pas définis, on appelle 'NameIntent'
        else if(sessionAttributes.playersTab[sessionAttributes.nbPlayer].name === 'Player ' + sessionAttributes.nbPlayer) {
            directive = 'NameIntent';
            console.log("Apres regle va dans name intent");
        }
        else {
            speakOutput = speakOutput + ` ${sessionAttributes.playersTab[sessionAttributes.playingPlayer].name} c'est à vous. ${currentActTruth}`;
        }
        return handlerInput.responseBuilder
            .addDelegateDirective(directive)
            .speak(speakOutput)
            .getResponse();
    }
}

//Pour enoncer le classement
const RankIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RankIntent'
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        let tabB = Object.values(sessionAttributes.playersTab);
        tabB.sort(function(a,b){return b.points - a.points;});
        let texteB = affichage(tabB, sessionAttributes.nbPlayer);
        console.log(sessionAttributes.playersTab);

        // choix de l'intent en fonction de si le joueur demande le classement avant/après son action/vérité ou la validation ou l'initialisation
        let directive = null;
        let currentActTruth = "";
        let speakOutput = "";
        // SI ACTION/VÉRITÉ STOCKÉ DANS sessionAttributes
        if(sessionAttributes.actVeritStocked!==null){
            directive = 'validationIntent';
            currentActTruth = sessionAttributes.actVeritStocked;
        }
        else{
            directive = 'ActionIntent';
            currentActTruth = ""
        }

        // SI L'INITIALISATION N'EST PAS ENCORE FAITE, ON APPELLE 'DialogIntent'
        if(sessionAttributes.nbPlayer===null || sessionAttributes.nbRound===null || sessionAttributes.level === null){
            directive = '';
            speakOutput = "Aucun classement pour l'instant, Dîtes 'commencer' pour démarrer la partie";
        }
        //si l'initialisation est faite mais les noms pas définis, on appelle 'NameIntent'
        else if(sessionAttributes.playersTab[sessionAttributes.nbPlayer].name === 'Player ' + sessionAttributes.nbPlayer) {
            directive = 'NameIntent';
            speakOutput = "Aucun classement pour l'instant";
        }
        else{
            speakOutput = `Voici le classement : ${texteB}, ${sessionAttributes.playersTab[sessionAttributes.playingPlayer].name} c'est à vous. ${currentActTruth}`;
        }


        return handlerInput.responseBuilder
            .addDelegateDirective(directive)
            .speak(speakOutput)
            .getResponse();
    }
}

// Intent initialisation
const DialogIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'DialogIntent'
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        
        sessionAttributes.nbPlayer = Alexa.getSlotValue(handlerInput.requestEnvelope, 'joueurs');
        sessionAttributes.nbRound = Alexa.getSlotValue(handlerInput.requestEnvelope, 'manches');
        sessionAttributes.level = Alexa.getSlotValue(handlerInput.requestEnvelope, 'level');
        sessionAttributes.nameToDefine = sessionAttributes.nbPlayer;
        const nbp = sessionAttributes.nbPlayer;
        
        for(var i=1; i<=nbp; i++) {
            sessionAttributes.playersTab[i] = { name:'Player '+i, points: 0 };
        }
        
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        
        const speakOutput = `Nous allons maintenant vous demander vos noms. ${sessionAttributes.playersTab[sessionAttributes.playingPlayer].name}` ;
        return handlerInput.responseBuilder
            .addDelegateDirective('NameIntent')
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// gestion des noms des joueurs
const NameIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'NameIntent' || Alexa.getIntentName(handlerInput.requestEnvelope) === 'SuperNameIntent')
    },
    handle(handlerInput) {
        let currentIntent = handlerInput.requestEnvelope.request.intent;
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        console.log('Dans intent name '+sessionAttributes.playingPlayer);
        console.log(sessionAttributes.nbPlayer)
        console.log(currentIntent)
        if (currentIntent.name === 'NameIntent'){
            currentIntent = 'SuperNameIntent';
        } else if (currentIntent.name === 'SuperNameIntent') {
            currentIntent = 'NameIntent';
        }
        
        if (sessionAttributes.playingPlayer < sessionAttributes.nbPlayer){
            sessionAttributes.playersTab[sessionAttributes.playingPlayer].name = Alexa.getSlotValue(handlerInput.requestEnvelope, 'name');
            console.log('nom modifié '+sessionAttributes.playersTab[sessionAttributes.playingPlayer].name);
            sessionAttributes.playingPlayer++;
            console.log('on passe à '+sessionAttributes.playingPlayer);
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
            
            const speakOutput = `${sessionAttributes.playersTab[sessionAttributes.playingPlayer].name}`;
            return handlerInput.responseBuilder
                .addDelegateDirective(currentIntent)
                .speak(speakOutput)
                .getResponse();
            
        } else if (String(sessionAttributes.playingPlayer) === String(sessionAttributes.nbPlayer)) {
            console.log('Dans ===========');
            sessionAttributes.playersTab[sessionAttributes.playingPlayer].name = Alexa.getSlotValue(handlerInput.requestEnvelope, 'name');
            console.log('nom modifié '+sessionAttributes.playersTab[sessionAttributes.playingPlayer].name);
            sessionAttributes.playingPlayer = 1;
            console.log('on reset à '+sessionAttributes.playingPlayer);
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
            
            const speakOutput = `Nous pouvons commencer la partie. ${sessionAttributes.playersTab[sessionAttributes.playingPlayer].name} c'est à vous.`;
            return handlerInput.responseBuilder
                .addDelegateDirective('ActionIntent')
                .speak(speakOutput)
                .getResponse();
        }
    }
}

// Intent Api
const GetActOrTruthIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ActionIntent';
    },
    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        //recupere la reponse du joueur (action ou verite)
        const aT = handlerInput.requestEnvelope.request.intent.slots.actOrTruth.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        console.log(aT);
        //appel api
        const apiResponse = await apiCallGetPut('GET', aT+'/level/'+sessionAttributes.level);
        if (apiResponse === 'ERROR'){
            const speakOutput = 'Rhalalalalalala Erreur sur le serveur. Impossible de jouer. Désolé mais on s\'arrete là...';
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .withShouldEndSession(true)
                .getResponse();
        }else{
            let result;
            if (aT === "verite"){
                result = apiResponse.body.verite;
                sessionAttributes.actVeritStocked = result;
            } else if (aT === "action"){
                result = apiResponse.body.action;
                sessionAttributes.actVeritStocked = result;
            }
            console.log(aT + ' : ' + result);
            result = result + "<audio src='soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_waiting_loop_30s_01'/>";
            //retour
            return handlerInput.responseBuilder
                .addDelegateDirective('validationIntent')
                .speak(result)
                .getResponse();
        }
    }
};
//gestion de la validation
const validationReponseIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'validationIntent';
    },
    async handle(handlerInput) {
        const { attributesManager, requestEnvelope } = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();
        //recupere oui ou non
        const validation = Alexa.getSlotValue(requestEnvelope, 'statePlayer');
        
        let tourValide = null;  // string message si tour validé ou non
        
        if(validation === 'oui'){
            
            // on augmente le nb de point du Joueur
            sessionAttributes.playersTab[sessionAttributes.playingPlayer].points += 1;
            
            tourValide = `Réponse de ${sessionAttributes.playersTab[sessionAttributes.playingPlayer].name} validée. ${sessionAttributes.playersTab[sessionAttributes.playingPlayer].points} points`;
            sessionAttributes.playingPlayer++;
            sessionAttributes.actVeritStocked = null;
            attributesManager.setSessionAttributes(sessionAttributes);
        }
        else{
            tourValide = `Réponse de ${sessionAttributes.playersTab[sessionAttributes.playingPlayer].name} refusée`;
            sessionAttributes.playingPlayer++;
            sessionAttributes.actVeritStocked = null;
            attributesManager.setSessionAttributes(sessionAttributes);
        }
        
        if(sessionAttributes.playingRound <= sessionAttributes.nbRound){
            // Si tous les joueurs ont déjà jouer dans la manche actuelle
            if(sessionAttributes.playingPlayer > sessionAttributes.nbPlayer){
                sessionAttributes.playingPlayer = 1;
                sessionAttributes.playingRound++;
                // fin de la partie
                if(sessionAttributes.playingRound > sessionAttributes.nbRound){
                    sessionAttributes.playingRound = 1;
                    sessionAttributes.playingPlayer = 1;
                    attributesManager.setSessionAttributes(sessionAttributes);
                    
                    let tabB = Object.values(sessionAttributes.playersTab);
                    tabB.sort(function(a,b){return b.points - a.points;});
                    let texteB = affichage(tabB, sessionAttributes.nbPlayer);
                    
                    return handlerInput.responseBuilder
                        .addDelegateDirective({
                            name: 'RestartIntent',
                            confirmationStatus: 'NONE',
                            slots: {}
                        })
                        .speak(`${tourValide}, Partie terminée, Voici le classement : ${texteB}. .... Dites "recommencer" pour recommencer une nouvelle partie en gardant les mêmes paramètres ou dites "stop" pour quitter.`)
                        .getResponse();
                }
                else{
                    attributesManager.setSessionAttributes(sessionAttributes);
                    return handlerInput.responseBuilder
                        .addDelegateDirective({
                            name: 'ActionIntent',
                            confirmationStatus: 'NONE',
                            slots: {}
                        })
                        .speak(`${tourValide}, La manche ${sessionAttributes.playingRound} commence, c'est au tour de ${sessionAttributes.playersTab[sessionAttributes.playingPlayer].name}`)
                        .getResponse();
                }
            }
            else{
                attributesManager.setSessionAttributes(sessionAttributes);
                return handlerInput.responseBuilder
                    .addDelegateDirective({
                        name: 'ActionIntent',
                        confirmationStatus: 'NONE',
                        slots: {}
                    })
                    .speak(`${tourValide}, Au tour de ${sessionAttributes.playersTab[sessionAttributes.playingPlayer].name}`)
                    .getResponse();
            }
        }
        else{
            sessionAttributes.playingPlayer = 1;
            sessionAttributes.playingRound = 1;
            attributesManager.setSessionAttributes(sessionAttributes);
            return handlerInput.responseBuilder
                .speak(`${tourValide}, Partie terminée`)
                .getResponse();
        }
    }
}

//Lancement d'une nouvelle partie
const RestartIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RestartIntent';
    },
    async handle(handlerInput) {
        //Reset des actions et des vérités
        const resetTru = await apiCallGetPut('PUT', 'verite/reset');
        const resetAct = await apiCallGetPut('PUT', 'action/reset');
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        var speakOutput, directive;
        if(sessionAttributes.nbPlayer===null || sessionAttributes.nbRound===null || sessionAttributes.level === null){
         
            directive = '';
            speakOutput = "Partie pas encore commencée pour l'instant, dites 'commencer' pour démarrer la partie";
        }
        else if (sessionAttributes.playersTab[sessionAttributes.nbPlayer].name === 'Player ' + sessionAttributes.nbPlayer){
            directive = 'NameIntent';
            speakOutput = '';
        }
        else {
            directive = 'ActionIntent';
            //Reset des points des joueurs
            resetPoints(sessionAttributes.playersTab, sessionAttributes.nbPlayer);
            const nbp = sessionAttributes.nbPlayer;
            speakOutput = `${nbp} joueurs et ${sessionAttributes.nbRound} manches. La partie peut recommencer. ${sessionAttributes.playersTab[sessionAttributes.playingPlayer].name} c'est à vous.`;
        
        }
        
        return handlerInput.responseBuilder
            .addDelegateDirective(directive)
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
}


const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        if(null!==handlerInput.requestEnvelope.request.error) {
            console.log(JSON.stringify(handlerInput.requestEnvelope.request.error));
        }
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        RulesIntentHandler,
        RankIntentHandler,
        DialogIntentHandler,
        NameIntentHandler,
        GetActOrTruthIntentHandler,
        validationReponseIntentHandler,
        RestartIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();