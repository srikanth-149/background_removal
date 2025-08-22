import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './configs/mongodb.js'
const app = express()

// Connect DB once
await connectDB()

app.use(express.json())
app.use(cors())

// Example route
app.get('/', (req, res) => {
  res.send("API Working")
})

// Export as handler for Vercel
export default app
