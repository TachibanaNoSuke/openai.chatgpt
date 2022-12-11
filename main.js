require('dotenv').config();

// openai
const {
    Configuration,
    OpenAIApi
} = require("openai");
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// line bot / express
const line = require('@line/bot-sdk');
const express = require('express');
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
};

/**
 * active http server
 */
const client = new line.Client(config);
const app = express();
app.post('/callback', line.middleware(config), (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
});

/**
 * 監聽事件
 * @param {*} event 
 * @returns 
 */
async function handleEvent(event) {
    console.log(event);
    if (event.type !== 'message' || event.message.type !== 'text') {
        console.log("'event.type !== 'message' || event.message.type !== 'text''")
        return Promise.resolve(null);
    }

    const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: event.message.text,
        max_tokens: 200
    });
    const echo = {
        type: 'text',
        text: completion.data.choices[0].text
    };
    return client.replyMessage(event.replyToken, echo);
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});