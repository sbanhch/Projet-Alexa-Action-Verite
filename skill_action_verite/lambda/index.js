const Alexa = require('ask-sdk-core');
const axios = require('axios');

//url api
const url = 'http://52.71.239.125/';

//appel api
const apiCallGetPut = async (type, param) => {
    try {
        if (type === 'GET'){
            const { data } = await axios.get(url+param);
            return data;
        } else if (type === 'PUT'){
            const { data } = await axios.put(url+param);
            return data;
        }
    }
    catch(error) {
        console.log('cannot fetch quotes' + error);
        return 'ERROR';
    }
};
//mise en forme du classement
function affichage (json,x) {
    let text = "";
    for(let i = 0; i<x; i++) {
        var j = i + 1;
        text = text + "Joueur " + json[i].name + " est " +  j + " avec " + json[i].points + " points \n";
    }
    return text;
}

//Intent de départ
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput) {
        console.log("Debut skill");
        const resetTru = await apiCallGetPut('PUT', 'verite/reset');
        const resetAct = await apiCallGetPut('PUT', 'action/reset');
        if (resetAct === 'ERROR' || resetTru === 'ERROR'){
            console.log('RESET TRUTH ' + resetTru);
            console.log('RESET ACT ' + resetAct);
            const speakOutput = 'Erreur sur le serveur. Il est impossible de jouer. Vraiment déso, je te dirai bien d\'appeler le service client pour te plaindre mais yen n\'a pas !';
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .withShouldEndSession(true)
                .getResponse();
        } else {
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
            sessionAttributes.nbPlayer = null;
            sessionAttributes.nbRound = null;
            sessionAttributes.level = 1;
            sessionAttributes.playingRound = 1;
            sessionAttributes.playingPlayer = 1;
            sessionAttributes.playersTab = {};
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

            const speakOutput = 'Bonjour et bienvenue sur Action ou Vérité. Dites "commencer" pour commencer une nouvelle partie.';
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }
    }
};
//Pour enoncer les regles
const RulesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RulesIntent'
    },
    handle(handlerInput) {
        const speakOutput = 'Les règles sont les suivantes : le joueur choisit entre Action et Vérité. Si il choisit Vérité il doit alors répondre de façon sincère à une question posée. Sinon s\'il choisit Action, une action est donnée et le joueur doit l\'accomplir. Le joueur obtient 1 point en cas de succès 0 sinon. Bonne chance !';

        return handlerInput.responseBuilder
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
        if(sessionAttributes.actVeritStocked!=null){
            directive = 'validationIntent';
            currentActTruth = sessionAttributes.actVeritStocked;
        }
        else{
            directive = 'ActionIntent';
            currentActTruth = ""
        }

        // SI L'INITIALISATION N'EST PAS ENCORE FAITE, ON APPELLE 'DialogIntent'
        if(sessionAttributes.nbPlayer==null || sessionAttributes.nbRound==null){
            directive = '';
            speakOutput = "Aucun classement pour l'instant, Dîtes 'commencer' pour démarrer la partie";
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

        sessionAttributes.nbPlayer = Alexa.getSlotValue(handlerInput.requestEnvelope, 'joueurs');//handlerInput.requestEnvelope.request.intent.slots.joueurs.value;
        sessionAttributes.nbRound = Alexa.getSlotValue(handlerInput.requestEnvelope, 'manches');//handlerInput.requestEnvelope.request.intent.slots.manches.value;
        sessionAttributes.level = Alexa.getSlotValue(handlerInput.requestEnvelope, 'level');//handlerInput.requestEnvelope.request.intent.slots.level.value;

        const nbp = sessionAttributes.nbPlayer;

        for(var i=1; i<=nbp; i++) {
            sessionAttributes.playersTab[i] = { name:'Player '+i, points: 0 };
        }

        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        const speakOutput = `${nbp} joueurs et ${sessionAttributes.nbRound} manches. La partie peut débuter. ${sessionAttributes.playersTab[sessionAttributes.playingPlayer].name} c'est à vous.`;
        return handlerInput.responseBuilder
            .addDelegateDirective('ActionIntent')
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
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
                result = apiResponse.verite;
                sessionAttributes.actVeritStocked = result;

            } else if (aT === "action"){
                result = apiResponse.action;
                sessionAttributes.actVeritStocked = result;
            }
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
            console.log(aT + ' : ' + result);
            //result = result + "<audio src='soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_waiting_loop_30s_01'/>";
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
                        .speak(`${tourValide}, Partie terminée, Voici le classement : ${texteB}`)
                        .withShouldEndSession(true)
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
                .withShouldEndSession(true)     // à supprimer si on veux redémarrer une partie avec les mêmes nombres de joueurs et de manches
                .getResponse();
        }
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
        GetActOrTruthIntentHandler,
        validationReponseIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();
