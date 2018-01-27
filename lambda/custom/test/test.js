const Skill = require('../index.js'); 
const expect = require("chai").expect;
const fixtures = require('../fixtures/phrase_mode_fixtures.js');


let DEBUG_RESPONSE = true;

const lambdaContext = function (test_func, done) {
    return {
        'succeed': function (data) {
            if (DEBUG_RESPONSE) {
                console.log(JSON.stringify(data, null, '\t'));
            }
            test_func(data);
            done()
        },
        'fail': done
    };
};


describe('PhraseMode', function () {
    describe('Get new phrase intent', function () {
        it('Get new phrase', function (done) {
            Skill['handler'](fixtures.GET_PHRASE, lambdaContext(function (data) {
                expect(data.sessionAttributes.STATE).to.equal("_PHRASE_MODE");
                expect(data.sessionAttributes.phrases_used).to.have.lengthOf(1);
                expect(data).to.have.property('response').with.property('outputSpeech').with.property("ssml");
                expect(data.response.outputSpeech.ssml).to.not.contain("Sorry");
                expect(data.response.outputSpeech.ssml).to.contain("<audio src=");
            }, done));
        });

        it('Repeat phrase after first hearing', function (done) {
            Skill['handler'](fixtures.REPEAT_PHRASE_ZERO_AFTER_FIRST_PHRASE, lambdaContext(function (data) {
                expect(data.sessionAttributes.STATE).to.equal("_PHRASE_MODE");
                expect(data.sessionAttributes.phrases_used).to.be.an('array').of.length(1).that.includes(0);
                expect(data.response.outputSpeech.ssml).to.contain("Thank you");
                expect(data.response.outputSpeech.ssml).to.contain("<audio src=");
            }, done));
        });

    });
});