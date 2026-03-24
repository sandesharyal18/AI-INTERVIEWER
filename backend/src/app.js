import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
const app=express()

app.use(cors({
  origin: "https://ai-interviewer-s7pq.onrender.com", // use your frontend's actual origin
  credentials: true
}));app.use(express.json({limit:"20kb"}))
app.use(express.urlencoded({extended:true,limit:"20kb"}))
app.use(express.static("public"))
app.use(cookieParser())

import googleauth from './router/auth.routes.js';
import question from './router/question.routes.js';
import user from './router/user.routes.js';
import interview from "./router/interview.routes.js"
// app.get('/api/question/getting', (req, res) => {
//   res.send('Route is working!');
// });
app.use('/api/auth',googleauth)
app.use('/api/question',question);
app.use('/api/user',user);
app.use('/api/interview',interview);
export default app;
