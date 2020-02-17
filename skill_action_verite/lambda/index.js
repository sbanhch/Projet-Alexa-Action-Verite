const Alexa = require('ask-sdk-core');
const axios = require('axios');

//url
const url = 'http://52.71.239.125/';

//appel api
const fetchQuotes = async (param) => {
    try {
        const { data } = await axios.get(url+param);
        return data;
    }
    catch(error) {
        console.log('cannot fetch quotes' + error);
        return 'Le serveur n\'est pas joignable, impossible de jouer';
    }
};
//fonction sleep
function sleep(ms){
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < ms);
}

//Intent de départ
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput) {
        console.log("Debut skill");
        await fetchQuotes('verite/reset');
        await fetchQuotes('action/reset');
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.nbPlayer = null;
        sessionAttributes.nbRound = null;
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
};
// Intent initialisation
const DialogIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'DialogIntent'
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        
        sessionAttributes.nbPlayer = handlerInput.requestEnvelope.request.intent.slots.joueurs.value;
        sessionAttributes.nbRound = handlerInput.requestEnvelope.request.intent.slots.manches.value;
        
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
        //recupere la reponse du joueur (action ou verite)
        const aT = handlerInput.requestEnvelope.request.intent.slots.actOrTruth.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        console.log(aT);
        //appel api
        const apiResponse = await fetchQuotes(aT);
        let result;
        if (aT === "verite"){
            result = apiResponse.verite;
        } else if (aT === "action"){
            result = apiResponse.action;
        }
        console.log(aT + ' : ' + result);
        //retour
        return handlerInput.responseBuilder
            .addDelegateDirective('validationIntent')
            .speak(result)
            .getResponse();
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
            // ......
            
            tourValide = `Réponse de ${sessionAttributes.playersTab[sessionAttributes.playingPlayer].name} validée`;
            sessionAttributes.playingPlayer++;
            attributesManager.setSessionAttributes(sessionAttributes);
        }
        else{
            
            // on réduit ou +0 le nb de point du Joueur
            // ......
            
            tourValide = `Réponse de ${sessionAttributes.playersTab[sessionAttributes.playingPlayer].name} refusée`;
            sessionAttributes.playingPlayer++;
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
                    return handlerInput.responseBuilder
                        .speak(`${tourValide}, Partie terminée`)
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

