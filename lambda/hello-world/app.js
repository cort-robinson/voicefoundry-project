// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
const AWS = require('aws-sdk');
const isWord = require('is-word');

const docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
let response;

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
exports.lambdaHandler = async (event, context) => {
    try {
        console.log('Processing...');

        // letterMap for letterCombos function
        const letterMap = { '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl', '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz' };

        // gets all the possible letter combinations of a given number
        // 1's and 0's in numbers trigger function to return empty string
        const letterCombos = function (number) {
            // if (number === null) return [];
            if (number.includes('0') || number.includes('1')) return [];
            const len = number.length;
            if (!len) return [];
            let ans = [];

            // depth first search
            const dfs = (pos, str) => {
                if (pos === len) ans.push(str);
                else {
                    let letters = letterMap[number[pos]];
                    for (let i = 0; i < letters.length; i++) {
                        dfs(pos + 1, str + letters[i]);
                    }
                }
            };
            dfs(0, '');
            return ans;
        };

        // initialize phoneNumber as null, then set it to the event.queryStringParameters.phoneNumber if valid
        let phoneNumber = null;
        let validWords = null;

        // use try catch in event no number is provided
        try {
            // check if phoneNumber given through queryString or contact-flow
            if (event.queryStringParameters && event.queryStringParameters.phoneNumber) {
                phoneNumber = event.queryStringParameters.phoneNumber;
            } else phoneNumber = event['Details']['ContactData']['CustomerEndpoint']['Address'];

            // remove all non-numeric characters from phoneNumber
            const reducedNumber = phoneNumber.replace(/\D/g, '');

            // initialize wordsList to store valid vanity number words
            let wordsList = [];
            // push possible vanity words to wordsList in order of highgest to lowest length
            wordsList.push(...letterCombos(reducedNumber.slice(-7)));
            wordsList.push(...letterCombos(reducedNumber.slice(-6)));
            wordsList.push(...letterCombos(reducedNumber.slice(-5)));
            wordsList.push(...letterCombos(reducedNumber.slice(-4)));
            wordsList.push(...letterCombos(reducedNumber.slice(-3)));

            // initialize is-word package to check if word is valid
            const englishWords = isWord('american-english');

            // filter out letter combinations that are not english words and get the first 5
            validWords = wordsList.filter(word => englishWords.check(word));
            if (validWords.length > 5) validWords.splice(5);
        } catch (err) {
            console.log('no number given');
        }

        // parameters for dynamoDB query
        const params = {
            Item: {
                date: Date.now(),
                message: validWords
            },
            TableName: 'vanity-numbers'
        };

        // http response
        response = {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            'body': JSON.stringify({
                message: validWords && validWords.length > 0 ? validWords : 'no valid words found',
            })
        };

        // insert into dynamoDB
        docClient.put(params, function (err, data) {
            if (err) {
                console.log(err);
            } else {
                console.log('db write success');
            }
        });
    } catch (err) {
        console.log(err);
        return err;
    }

    return response;
};
