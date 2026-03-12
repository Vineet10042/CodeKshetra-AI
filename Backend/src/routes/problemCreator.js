const express = require('express');

const problemRouter =  express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const {createProblem, updateProblem, deleteProblem, getProblemById, getAllProblem, solvedAllProblembyUser, submittedProblem} = require("../controllers/userproblem");
const userMiddleware = require("../middleware/userMiddleware");


// Create                 admin middleware lagaenge kyuki problrem ko create karne se pehle authenticate karna padega ki jo problem create kar rha hai wo admin hai ya nhi hai
problemRouter.post("/create", adminMiddleware, createProblem);

// update
problemRouter.put("/update/:id", adminMiddleware, updateProblem); 
 
//delete
problemRouter.delete("/delete/:id", adminMiddleware, deleteProblem); 

//fetch
problemRouter.get("/problemById/:id", userMiddleware,getProblemById);
problemRouter.get("/getAllProblem", userMiddleware, getAllProblem);
problemRouter.get("/problemSolvedByUser", userMiddleware, solvedAllProblembyUser);
problemRouter.get("/submittedProblem/:pid", userMiddleware, submittedProblem);


module.exports = problemRouter;

