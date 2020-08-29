const express = require("express")
require("./db/database")

const userRouter = require("./routers/user")
const flashcardRouter = require("./routers/flashcard")

const app = express()
const port = process.env.PORT

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  next()
})

app.use(express.json())
app.use(userRouter)
app.use(flashcardRouter)

app.listen(port, () => {
  console.log("Server is up on port " + port)
})


