const Skill = require('../index.js'); 
const expect = require("chai").expect;
const fixtures = require('../fixtures/factory.js');

let DEBUG_RESPONSE = false;

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
         it('Launch with phrase', function (done) {
            Skill['handler'](fixtures.intentRequestFixture({}, "EstonianPhraseIntent"),
                lambdaContext(function (data) {
                expect(data.sessionAttributes.STATE).to.equal("_PHRASE_MODE");
                expect(data.sessionAttributes.phrases_used).to.be.an('array').of.length(1);
                expect(data.response.outputSpeech.ssml).to.contain("<audio src=");
            }, done));
        });

        it('Repeat phrase after first hearing', function (done) {
            Skill['handler'](fixtures.intentRequestFixture({
                    "STATE":"_PHRASE_MODE", 
                    "phrases_used": [0],
                }, "AMAZON.RepeatIntent"),
                lambdaContext(function (data) {
                expect(data.sessionAttributes.STATE).to.equal("_PHRASE_MODE");
                expect(data.sessionAttributes.phrases_used).to.be.an('array').of.length(1).that.includes(0);
                    expect(data.response.outputSpeech.ssml).to.contain("Thank you");
                expect(data.response.outputSpeech.ssml).to.contain("<audio src=");
            }, done));
        });
    });
});