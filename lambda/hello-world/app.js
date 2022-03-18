// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
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
        // remove all non-numeric characters then remove all but last 7 digits
        reducedNumber = phoneNumber.replace(/\D/g, '').slice(-7);

        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: letterCombos(reducedNumber),
                // location: ret.data.trim()
            })
        };
    } catch (err) {
        console.log(err);
        return err;
    }

    return response;
};
