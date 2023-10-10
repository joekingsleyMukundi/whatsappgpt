require('dotenv').config()
const express = require("express")
const bodyParser = require("body-parser")
const cors = require('cors');
const OpenAI = require('openai')
var twilio = require('twilio');
const app = express()
//middleware
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(cors())
//end middlware
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const accountSid = process.env.ACCOUNTSID
const authToken =  process.env.AUTHTOKEN
const TWILIO_NUMBER = process.env.TWILIOWHATSAPP

app.post('/prompt', async(req, res, next)=>{
    const promting = req.body.Body
    const from = req.body.From
    console.log(req.body);
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                role: "system",
                content: "You are a helpful assistant.",
                },
                {
                role: "user",
                content: promting,
                },
            ],
        });
        var client = new twilio(accountSid, authToken);
        client.messages.create({
            to:from,
            from:TWILIO_NUMBER,
            body:response.choices[0].message.content
        }, function(error, message) {
            if (!error) {
                console.log('Open Api responce');
                console.log(response.choices[0].message.content);

                console.log('Success! The SID for this SMS message is:');
                console.log(message.sid);

                console.log('Message sent on:');
                console.log(message.dateCreated);
                return res.status(201).json({
                    success: true,
                    responce: response
                })
            } else {
                console.log('Oops! There was an error.');
                return res.status(201).json({
                    success: false,
                    responce: error
                })
            }
        });
    } catch (error) {
        var client = new twilio(accountSid, authToken);
        client.messages.create({
            to:from,
            from:TWILIO_NUMBER,
            body:'err ahoy hoy! Testing Twilio and node.js'
        }, function(err, message) {
            if (!err) {
                console.log("Open Api error");
                console.log(error);
                console.log('Success! The SID for this SMS message is:');
                console.log(message.sid);

                console.log('Message sent on:');
                console.log(message);
                return res.status(201).json({
                    success: true,
                    responce: "hey"
                })
            } else {
                console.log('Oops! There was an error.');
                console.log(err);
                return res.status(201).json({
                    success: false,
                    responce: error
                })
            }
        });
    }
})

app.get("/payment",(req,res)=>{
    res.status(200).send("hey")
})

const port = process.env.PORT || 3000;
const dbConn = async()=>{
  try {
    app.listen(port,()=>{
      console.log(`server live at port ${port}`);
    });
  } catch (error) {
    console.error(error);
  }
};
dbConn();