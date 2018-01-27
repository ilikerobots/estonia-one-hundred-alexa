'use strict';
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
const Skill = require('../index.js');

const SESSION_ID = "SessionId.f9e6dcbb-b7da-4b47-905c.etc.etc";
const USER_ID = "amzn1.ask.account.VO3PVTGF563MOPBY.etc.etc";

module.exports = {
    GET_PHRASE: {
        "session": {
            "new": false,
            "sessionId": SESSION_ID,
            "application": {"applicationId": Skill.APP_ID,},
            "attributes": {
                "STATE": "_PHRASE_MODE"
            },
            "user": {"userId": USER_ID}
        },
        "request": {
            "type": "IntentRequest",
            "requestId": "request5678",
            "intent": {
                "name": "EstonianPhraseIntent",
                "slots": {}
            },
            "locale": "en-US",
            "timestamp": "2018-01-06T14:25:57Z"
        },
        "version": "1.0"
    },
    REPEAT_PHRASE_ZERO_AFTER_FIRST_PHRASE: {
        "session": {
            "new": false,
            "sessionId": SESSION_ID,
            "application": {"applicationId": Skill.APP_ID,},
            "attributes": {
                "STATE": "_PHRASE_MODE",
                "phrases_used": [
                    0
                ]
            },
            "user": {"userId": USER_ID,}
        },
        "request": {
            "type": "IntentRequest",
            "requestId": "EdwRequestId.da2fc3ab-5fe9-46ff-b6d8-779a90d567d0",
            "intent": {
                "name": "AMAZON.RepeatIntent",
                "slots": {}
            },
            "locale": "en-US",
            "timestamp": "2018-01-27T14:21:41Z"
        },
        "version": "1.0"
    }

};
