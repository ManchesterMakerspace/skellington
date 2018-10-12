// skellington.js Member Retention Service ~ Copyright 2018 Paul Beaudet ~ MIT License
// 'use strict';

var crypto = require('crypto');                      // verify request from slack is from slack with hmac-256
var querystring = require('querystring');            // Parse urlencoded body

module.exports.remember = function(event, context, callback) {
    var body = querystring.parse(event.body);        // Parse urlencoded body
    var response = {statusCode: 403};                // until request is authentically varified as from slack
    if(varify.request(event)){                       // make sure this request comes from slack
        console.log(body);
        response = {
            statusCode: 200,
            headers: {'Content-type': 'application/json'},   // content type for richer responses beyound just text
            body: JSON.stringify({'text' : 'I am your king!'})
        };
        callback(null, response);
    }
};

var helper = {
    getName: function(contact){
        var contactArray = contact.split(' ');        // diliminate peices of name array on spaces
        var name = {first: '', last: ''};             // establish an object to return with expected name data
        for(var i = 0; i < contactArray.length; i++){ // iterate over all peices of name
            if(i){ name.last += contactArray[i];}     // just compile segemented peices as a complete last name
            else { name.first = contactArray[0];}     // Just one first name please
        }
        return name;
    }
};

var varify = {
    slack_sign_secret: process.env.SLACK_SIGNING_SECRET,
    request: function(event){
        var timestamp = event.headers['X-Slack-Request-Timestamp'];        // nonce from slack to have an idea
        var secondsFromEpoch = Math.round(new Date().getTime() / 1000);    // get current seconds from epoch because thats what we are comparing with
        if(Math.abs(secondsFromEpoch - timestamp > 60 * 5)){return false;} // make sure request isn't a duplicate
        var computedSig = 'v0=' + crypto.createHmac('sha256', varify.slack_sign_secret).update('v0:' + timestamp + ':' + event.body).digest('hex');
        return crypto.timingSafeEqual(Buffer.from(event.headers['X-Slack-Signature'], 'utf8'), Buffer.from(computedSig ,'utf8'));
    }
};
