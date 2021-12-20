const express = require('express')
const cors = require('cors')
const fs = require('fs');

const app = express();

const corsOptions ={
    origin:'*', 
    credentials:true,           
    optionSuccessStatus:200,
}

app.use(cors(corsOptions)) 
app.use(express.json());

app.post("/save", (req, res) => {
    res.json(req.body)
    fs.writeFileSync('log.txt',  JSON.stringify(req.body,null,2))
})

app.listen(5001, () => console.log("Running on host 5001"))