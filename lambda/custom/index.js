/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/* Copyright 2018 Mike Hoolehan 

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';
const Alexa = require('alexa-sdk');
const Speech = require('ssml-builder');
const Facts = require('./facts');
const Phrases = require('./phrases');
const Proverbs = require('./proverbs');
const Language = require('./language_strings');

const APP_ID = "amzn1.ask.skill.f53d6aa0-26f6-4eef-a232-3331682626bc";
const SKILL_NAME = 'Estonia One Hundred';

const states = {
    FACT_MODE: '_FACT_MODE', // User is getting facts
    PHRASE_MODE: '_PHRASE_MODE', // User is getting Estonian phrases
    PROVERB_MODE: '_PROVERB_MODE' // User is getting proverbs
};

const ATTRIBS = {
    FACTS_USED: 'facts_used',
    PHRASES_USED: 'phrases_used',
    PROVERS_USED: 'proverbs_used'
};

const INTENTS = {
    NEW_SESSION: 'NewSession',
    GET_NEW_FACT: 'GetNewFactIntent',
    GET_NEW_PHRASE: 'EstonianPhraseIntent',
    GET_NEW_PROVERB: 'EstonianProverbIntent',
    CANNOT_SPEAK_ESTONIAN: 'CannotSpeakEstonianIntent',
    CUSTOM_GOODBYE: 'CustomGoodbyeIntent',
    YES: 'AMAZON.YesIntent',
    NO: 'AMAZON.NoIntent',
    REPEAT: 'AMAZON.RepeatIntent',
    HELP: 'AMAZON.HelpIntent',
    STOP: 'AMAZON.StopIntent',
    CANCEL: 'AMAZON.CancelIntent',
    UNHANDLED: 'Unhandled',
    LAUNCH_REQUEST: "LaunchRequest",
};


exports.handler = function (event, context, callback) {
    let alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(newSessionHandlers, factModeHandlers, phraseModeHandlers, proverbModeHandlers);

    alexa.resources = Language.LANGUAGE_STRINGS;
    alexa.execute();
};

//TODO teach me how to become an e-citizen

const newSessionHandlers = {
    [INTENTS.HELP]: function () {
        let speech = new Speech();
        speech.sayWithSSML(getRandomFromList(Language.ESTONIAN_PHRASES.HELLOS));
        speech.pause('500ms');
        speech.say(this.t('HELP_MESSAGE'));
        this.emit(':ask', speech.ssml(true), this.t('HELP_REPROMPT'));
    },
    [INTENTS.GET_NEW_FACT]: function () {
        this.handler.state = states.FACT_MODE;
        this.emitWithState(INTENTS.GET_NEW_FACT);
    },
    [INTENTS.GET_NEW_PHRASE]: function () {
        this.handler.state = states.PHRASE_MODE;
        this.emitWithState(INTENTS.GET_NEW_PHRASE);
    },
    [INTENTS.GET_NEW_PROVERB]: function () {
        this.handler.state = states.PROVERB_MODE;
        this.emitWithState(INTENTS.GET_NEW_PROVERB);
    },
    [INTENTS.LAUNCH_REQUEST]: function () {
        this.emit(INTENTS.HELP);
    },
    [INTENTS.STOP]: function () {
        this.response.speak(getRandomFromList(Language.ESTONIAN_PHRASES.GOODBYES));
        this.emit(':responseReady');
    },
    [INTENTS.CANCEL]: function () {
        this.response.speak(getRandomFromList(Language.ESTONIAN_PHRASES.GOODBYES));
        this.emit(':responseReady');
    },
    [INTENTS.CUSTOM_GOODBYE]: function () {
        this.response.speak(getRandomFromList(Language.ESTONIAN_PHRASES.GOODBYES));
        this.emit(':responseReady');
    },
    [INTENTS.UNHANDLED]: function () {
        this.response.speak('Sorry, I didn\'t get that. ' + this.t('HELP_MESSAGE')).listen('Try again.');
        this.emit(':responseReady');
    }
};

const factModeHandlers = Alexa.CreateStateHandler(states.FACT_MODE, {
    [INTENTS.GET_NEW_FACT]: function () {
        this.handler.state = states.FACT_MODE;
        if (!(ATTRIBS.FACTS_USED in this.attributes)) {
            this.attributes[ATTRIBS.FACTS_USED] = [];
        } else if (this.attributes[ATTRIBS.FACTS_USED].length >= Facts.FACTS.FACTS_EN_US.length) {
            this.attributes[ATTRIBS.FACTS_USED] = [];
        }
        let prefix = '';
        if (this.attributes[ATTRIBS.FACTS_USED].length === 0) {
            prefix = this.t('GET_FACT_MESSAGE');
        }

        let randomFactEl = getRandomFromListWithIndex(Facts.FACTS.FACTS_EN_US, this.attributes[ATTRIBS.FACTS_USED]);
        this.attributes[ATTRIBS.FACTS_USED].push(randomFactEl[0]);

        let randomFact = randomFactEl[1];
        this.emit(':askWithCard', renderFactSpeech(randomFact, this, prefix), this.t('PLEASE_REPEAT'), "An Estonian fact", randomFact);
    },

    [INTENTS.GET_NEW_PHRASE]: function () {
        this.handler.state = states.PHRASE_MODE;
        this.emitWithState(INTENTS.GET_NEW_PHRASE);
    },
    [INTENTS.GET_NEW_PROVERB]: function () {
        this.handler.state = states.PROVERB_MODE;
        this.emitWithState(INTENTS.GET_NEW_PROVERB);
    },

    [INTENTS.YES]: function () {
        this.emitWithState(INTENTS.GET_NEW_FACT);
    },
    [INTENTS.NO]: function () {
        this.response.speak(getRandomFromList(Language.ESTONIAN_PHRASES.GOODBYES));
        this.emit(':responseReady');
    },
    [INTENTS.REPEAT]: function () {
        if (!(ATTRIBS.FACTS_USED in this.attributes)) {
            this.attributes[ATTRIBS.FACTS_USED] = [];
        }
        if (this.attributes[ATTRIBS.FACTS_USED].length === 0) {
            this.emitWithState(INTENTS.GET_NEW_FACT);
        } else {
            let lastIndex = this.attributes[ATTRIBS.FACTS_USED][this.attributes[ATTRIBS.FACTS_USED].length - 1];
            let fact = Facts.FACTS.FACTS_EN_US[lastIndex];
            this.emit(':askWithCard', renderFactSpeech(fact, this), this.t('PLEASE_REPEAT'), "An Estonian fact", fact);
        }
    },
    [INTENTS.HELP]: function () {
        this.response.speak(this.t('HELP_MESSAGE')).listen(this.t('HELP_REPROMPT'));
        this.emit(':responseReady');
    },
    [INTENTS.CANCEL]: function () {
        this.response.speak(getRandomFromList(Language.ESTONIAN_PHRASES.GOODBYES));
        this.emit(':responseReady');
    },
    [INTENTS.STOP]: function () {
        this.response.speak(getRandomFromList(Language.ESTONIAN_PHRASES.GOODBYES));
        this.emit(':responseReady');
    },
    [INTENTS.CANNOT_SPEAK_ESTONIAN]: function () {
        let speech = new Speech();
        speech.say(this.t('NO_ESTONIAN'));
        let speechOutput = speech.ssml(true);
        this.emit(':ask', speechOutput, this.t('PLEASE_REPEAT'));
    },
    [INTENTS.CUSTOM_GOODBYE]: function () {
        this.response.speak(getRandomFromList(Language.ESTONIAN_PHRASES.GOODBYES));
        this.emit(':responseReady');
    },
    [INTENTS.UNHANDLED]: function () {
        this.response.speak('Sorry, I didn\'t get that. ' + this.t('HELP_MESSAGE')).listen('Try again.');
        this.emit(':responseReady');
    }
});


const phraseModeHandlers = Alexa.CreateStateHandler(states.PHRASE_MODE, {
    [INTENTS.GET_NEW_PHRASE]: function () {
        if (!(ATTRIBS.PHRASES_USED in this.attributes)) {
            this.attributes[ATTRIBS.PHRASES_USED] = [];
        } else if (this.attributes[ATTRIBS.PHRASES_USED].length >= Phrases.PHRASES.PHRASES_EN_US.length) {
            this.attributes[ATTRIBS.PHRASES_USED] = [];
        }
        let phraseEl = getRandomFromListWithIndex(Phrases.PHRASES.PHRASES_EN_US, this.attributes[ATTRIBS.PHRASES_USED]);
        this.attributes[ATTRIBS.PHRASES_USED].push(phraseEl[0]);

        let phrase = phraseEl[1];
        this.emit(':askWithCard', renderPhraseSpeech(phrase, this), this.t('PLEASE_REPEAT'), phrase[1], 
            phrase[3] + '"' + phrase[1] + '"');
    },

    [INTENTS.CANNOT_SPEAK_ESTONIAN]: function () {
        let speech = new Speech();
        speech.say(this.t('NO_ESTONIAN'));
        let speechOutput = speech.ssml(true);
        this.emit(':ask', speechOutput, this.t('PLEASE_REPEAT'));
    },

    [INTENTS.GET_NEW_FACT]: function () {
        this.handler.state = states.FACT_MODE;
        this.emitWithState(INTENTS.GET_NEW_FACT);
    },
    [INTENTS.GET_NEW_PROVERB]: function () {
        this.handler.state = states.PROVERB_MODE;
        this.emitWithState(INTENTS.GET_NEW_PROVERB);
    },
    [INTENTS.YES]: function () {
        this.emitWithState(INTENTS.GET_NEW_PHRASE);
    },
    [INTENTS.NO]: function () {
        this.response.speak(getRandomFromList(Language.ESTONIAN_PHRASES.GOODBYES));
        this.emit(':responseReady');
    },
    [INTENTS.REPEAT]: function () {
        if (!(ATTRIBS.PHRASES_USED in this.attributes)) {
            this.attributes[ATTRIBS.PHRASES_USED] = [];
        }
        if (this.attributes[ATTRIBS.PHRASES_USED].length === 0) {
            this.emitWithState(INTENTS.GET_NEW_PHRASE);
        } else {
            let lastIndex = this.attributes[ATTRIBS.PHRASES_USED][this.attributes[ATTRIBS.PHRASES_USED].length - 1];
            let phrase = Phrases.PHRASES.PHRASES_EN_US[lastIndex];
            this.emit(':askWithCard', renderPhraseSpeech(phrase, this), this.t('PLEASE_REPEAT'), phrase[1], 
                phrase[3] + '"' + phrase[1] + '"');
        }
    },
    [INTENTS.HELP]: function () {
        this.response.speak(this.t('HELP_MESSAGE')).listen(this.t('HELP_REPROMPT'));
        this.emit(':responseReady');
    },
    [INTENTS.CANCEL]: function () {
        this.response.speak(getRandomFromList(Language.ESTONIAN_PHRASES.GOODBYES));
        this.emit(':responseReady');
    },
    [INTENTS.STOP]: function () {
        this.response.speak(getRandomFromList(Language.ESTONIAN_PHRASES.GOODBYES));
        this.emit(':responseReady');
    },
    [INTENTS.CUSTOM_GOODBYE]: function () {
        this.response.speak(getRandomFromList(Language.ESTONIAN_PHRASES.GOODBYES));
        this.emit(':responseReady');
    },
    [INTENTS.UNHANDLED]: function () {
        this.response.speak('Sorry, I didn\'t get that. ' + this.t('HELP_MESSAGE')).listen('Try again.');
        this.emit(':responseReady');
    },
});

const proverbModeHandlers = Alexa.CreateStateHandler(states.PROVERB_MODE, {
    [INTENTS.GET_NEW_PROVERB]: function () {
        if (!(ATTRIBS.PROVERS_USED in this.attributes)) {
            this.attributes[ATTRIBS.PROVERS_USED] = [];
        } else if (this.attributes[ATTRIBS.PROVERS_USED].length >= Proverbs.PROVERBS.PROVERBS_EN_US.length) {
            this.attributes[ATTRIBS.PROVERS_USED] = [];
        }
        let proverbEl = getRandomFromListWithIndex(Proverbs.PROVERBS.PROVERBS_EN_US, this.attributes[ATTRIBS.PROVERS_USED]);
        this.attributes[ATTRIBS.PROVERS_USED].push(proverbEl[0]);

        let proverb = proverbEl[1];
        this.emit(':askWithCard', renderProverbSpeech(proverb, this), this.t('PLEASE_REPEAT'), "An Estonian proverb", proverb);
    },

    [INTENTS.CANNOT_SPEAK_ESTONIAN]: function () {
        let speech = new Speech();
        speech.say(this.t('NO_ESTONIAN'));
        let speechOutput = speech.ssml(true);
        this.emit(':ask', speechOutput, this.t('PLEASE_REPEAT'));
    },

    [INTENTS.GET_NEW_FACT]: function () {
        this.handler.state = states.FACT_MODE;
        this.emitWithState(INTENTS.GET_NEW_FACT);
    },
    [INTENTS.GET_NEW_PHRASE]: function () {
        this.handler.state = states.PHRASE_MODE;
        this.emitWithState(INTENTS.GET_NEW_PHRASE);
    },
    [INTENTS.YES]: function () {
        this.emitWithState(INTENTS.GET_NEW_PROVERB);
    },
    [INTENTS.NO]: function () {
        this.response.speak(getRandomFromList(Language.ESTONIAN_PHRASES.GOODBYES));
        this.emit(':responseReady');
    },
    [INTENTS.REPEAT]: function () {
        if (!(ATTRIBS.PROVERS_USED in this.attributes)) {
            this.attributes[ATTRIBS.PROVERS_USED] = [];
        }
        if (this.attributes[ATTRIBS.PROVERS_USED].length === 0) {
            this.emitWithState(INTENTS.GET_NEW_PROVERB);
        } else {
            let lastIndex = this.attributes[ATTRIBS.PROVERS_USED][this.attributes[ATTRIBS.PROVERS_USED].length - 1];
            let proverb = Proverbs.PROVERBS.PROVERBS_EN_US[lastIndex];
            this.emit(':askWithCard', renderProverbSpeech(proverb, this), this.t('PLEASE_REPEAT'), "An Estonian proverb", proverb);
        }
    },
    [INTENTS.HELP]: function () {
        this.response.speak(this.t('HELP_MESSAGE')).listen(this.t('HELP_REPROMPT'));
        this.emit(':responseReady');
    },
    [INTENTS.CANCEL]: function () {
        this.response.speak(getRandomFromList(Language.ESTONIAN_PHRASES.GOODBYES));
        this.emit(':responseReady');
    },
    [INTENTS.STOP]: function () {
        this.response.speak(getRandomFromList(Language.ESTONIAN_PHRASES.GOODBYES));
        this.emit(':responseReady');
    },
    [INTENTS.CUSTOM_GOODBYE]: function () {
        this.response.speak(getRandomFromList(Language.ESTONIAN_PHRASES.GOODBYES));
        this.emit(':responseReady');
    },
    [INTENTS.UNHANDLED]: function () {
        this.response.speak('Sorry, I didn\'t get that. ' + this.t('HELP_MESSAGE')).listen('Try again.');
        this.emit(':responseReady');
    },
});



function renderFactSpeech(fact, that, prefix = '') {
    let speech = new Speech();
    speech.say(prefix).say(fact).pause('700ms').say(that.t('MOREFACTS_MESSAGE'));
    return speech.ssml(true);
}
function renderProverbSpeech(fact, that, prefix = '') {
    let speech = new Speech();
    speech.say(prefix).say(fact).pause('700ms').say(that.t('MORE_PROVERBS_MESSAGE'));
    return speech.ssml(true);
}

function renderPhraseSpeech(phrase, that) {
    let speech = new Speech();
    speech.say(that.t(phrase[3])).pause('600ms').audio(phrase[0]);
    if (phrase.length > 4) {
        speech.say(phrase[4]);
    }
    speech.pause('700ms').say(that.t('MOREPHRASES_MESSAGE'));

    return speech.ssml(true);
}

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomFromList(l) {
    return l[getRandom(0, l.length - 1)];

}

function getRandomFromListWithIndex(l, skipIndexes = []) {
    let skips = [];
    if (skipIndexes.length < l.length) {
        skips = skipIndexes;
    }
    let rNum = getRandom(0, l.length - 1);

    while (skips.includes(rNum % l.length)) {
        rNum++;
    }
    return [rNum, l[rNum % l.length]];
}

