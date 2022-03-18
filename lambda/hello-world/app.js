// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
const isWord = require('is-word');
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
        // const ret = await axios(url);

        const letterMap = { '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl', '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz' };

        // gets all the possible letter combinations of a given number
        // currently does not support numbers with 1's or 0's since they are not included in the letterMap
        const letterCombos = function (number) {
            let len = number.length, ans = [];
            if (!len) return [];

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

        // phoneNumber = event.pathParameters.phoneNumber;
        phoneNumber = '1-800-356-9377';
        // remove all non-numeric characters
        reducedNumber = phoneNumber.replace(/\D/g, '');

        wordsList = [];

        wordsList.push(...letterCombos(reducedNumber.slice(-7)));
        wordsList.push(...letterCombos(reducedNumber.slice(-6)));
        wordsList.push(...letterCombos(reducedNumber.slice(-5)));
        wordsList.push(...letterCombos(reducedNumber.slice(-4)));
        wordsList.push(...letterCombos(reducedNumber.slice(-3)));

        // const isWord = require('is-word');

        // initialize is-word import
        const englishWords = isWord('american-english');

        // filter out letter combinations that are not english words and get the first 5
        const validWords = wordsList.filter(word => englishWords.check(word));
        if (validWords.length > 5) validWords.splice(5);

        // for testing purposes
        // console.log(validWords);

        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: validWords,
                // location: ret.data.trim()
            })
        };
    } catch (err) {
        console.log(err);
        return err;
    }

    return response;
};
