import { Router } from 'express';
// import QuestionList from '../controller/que.controller.js'; // Note the .js extension
import {generateQuestions,getUser} from '../controller/openai.controller.js'
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

// router.route("/set").post(QuestionList);
router.post("/generate-questions",verifyJWT, generateQuestions);
router.get("/getuser",verifyJWT,getUser)
export default router;
