import express from 'express';
import cors from 'cors';
// import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { connectDB } from './config/db.js';
import { fileURLToPath } from "url";
import User from './models/user.model.js';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';


const app = express();
const port = process.env.PORT || 8000;


dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('Error: Missing API key(s). Please add them to your .env file.');
  process.exit(1);
}

app.post('/api/practice/feedback', async (req, res) => {

  try{
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
    });
    
    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };

    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {text: "You are acting as a person taking an HR Interview. You will get a question and the response you have gotten from the interviewee for that question. Please give feedback for the same on how well worded it is, how relevant it is, how smooth the articulation is, and how well the question is answered. Always start your response with 'Good answer, but you can improve it by:' and then number the points as you give feedback. finally give a rating out of 5 to that answer. Always give a answer formatted in markdown}"},
            // \nplease give your feedback in json with a format similar to this\n{\nrelevance:\narticulation:\nconfidence:\nquality:\nrating:\n
          ],
        },
        {
          role: "model",
          parts: [
            {text: "Okay, I understand. I will act as an HR interviewer and provide feedback in format as you've described. Let's begin! I'm ready for the first question and the interviewee's response.\n"},
          ],
        },
      ],
    });

    const result = await chatSession.sendMessage(`${req.body.question}\nAns: ${req.body.message}`);
    console.log(result.response.text());
    
    res.json({ message: result.response.text() });

    console.log(req.body.userEmail );

    if(req.body.userEmail != ""){
      await User.updateOne(
        { email: req.body.userEmail }, 
        { $inc: { prac_attempts: 1 } }
      );
      
    }
  } catch (error) {
    console.error('Error communicating with Gemini API:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to get response from Gemini API' });
  };

 

});

app.post('/api/mock/attempts', async (req, res) => {

  try{
    console.log(req.body.userEmail );

    if(req.body.userEmail != ""){
      await User.updateOne(
        { email: req.body.userEmail }, 
        { $inc: { mock_attempts: 1 } }
      );
      
    }
  } catch (error) {
    console.error('Error communicating with Gemini API:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to get response from Gemini API' });
  };

 

});

app.post('/api/mock/feedback', async (req, res) => {

  try{
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
    });
    
    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };

    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {text: "You are acting as a person taking an HR Interview. You will get a question and the response you have gotten from the interviewee for that question. Please give feedback for the same in a conversational and succinct but formal manner like you are in an actual interview.}"},
            // \nplease give your feedback in json with a format similar to this\n{\nrelevance:\narticulation:\nconfidence:\nquality:\nrating:\n
          ],
        },
        {
          role: "model",
          parts: [
            {text: "Okay, I understand. I will act as an HR interviewer and provide feedback as you've described. Let's begin! I'm ready for the first question and the interviewee's response.\n"},
          ],
        },
      ],
    });

    const result = await chatSession.sendMessage(`${req.body.question}\nAns: ${req.body.message}`);
    console.log(result.response.text());
    
    res.json({ message: result.response.text() });

  } catch (error) {
    console.error('Error communicating with Gemini API:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to get response from Gemini API' });
  };

 

});




app.get('/api/practice/question', (req, res) => {
  const filePath = path.join(__dirname, 'assets', 'prac_ques.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if(err){
      console.error("Error reading JSON file:", err);
      return res.status(500).json({error: 'Failed to fetch question.'});
    }

    try{
      const questions = JSON.parse(data).hr;
      console.log(questions)
      const random = Math.floor(Math.random() * questions.length);
      const quest = questions[random];
      console.log("Random:", random);
      console.log("Ques:",quest);
      res.json({ ques: quest.ques }); 
    } catch(parseError){
      console.error("Error parsing JSON file:", parseError);
      res.status(500).json({error: "Failed to process and send question."});
    }
  });
});

app.get('/api/dashboard', async (req, res) => {
  try {
    const email = req.headers['email'];  
    // console.log(email);
    const user = await User.findOne({ email: email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Send back user stats
    const userStats = {
      prac_attempts: user.prac_attempts,
      prac_rating: user.prac_rating,
      mock_attempts: user.mock_attempts,
      mock_rating: user.mock_rating,
    };

    res.json(userStats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



//Mongo

app.post("/api/users", async (req, res) => {
  const user = req.body;

  if(!user.username || !user.email || !user.password){
    return res.status(400).json({success:false, message: "Please provide all fields"});
  }

  const newUser = new User(user);

  try{
    await newUser.save();
    res.status(201).json({success: true, data: newUser});
  }catch (error){
    console.error("Error in creating product", error.message);
    res.status(500).json({success: false, message: "Server Error"});
  }
})

app.delete("/api/users/:username", async (req, res) => {
  const {username} = req.params;
  try{
    await User.findByIdAndDelete(username);
    res.status(200).json({success: true, message: "Deleted"});
  }catch(error){
    res.status(404).json({success:false, message:"Product not found"});
  }
});


// Login endpoint
app.post("/api/users/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});



app.listen(port, () => {
  connectDB();
  console.log(`Server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode.`);
});
