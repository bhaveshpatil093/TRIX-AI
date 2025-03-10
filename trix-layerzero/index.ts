import cors from 'cors'
import express from 'express'
import { rateLimit } from 'express-rate-limit'
import dotenv from 'dotenv'
import router from './routes/index'
dotenv.config({ path: '.env' })

const app = express()
const corsOptions = {
    origin: true, // This will enable CORS for all origins
    credentials: true,
}

app.use(express.json())
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// const limiter = rateLimit({
//     windowMs: 60 * 1000, // 1 minutes
//     max: 2, // Limit each IP to 100 requests per windowMs
//     message: 'Too many requests,2 req/minute allowed',
// })

// app.use(limiter)
app.get("/",async (req,res)=>{
    res.send("Hello World")
});
app.use('/api', router)

app.listen(process.env.PORT ? process.env.PORT : 3000, function () {
    console.log(`Server is running on port ${process.env.PORT ? process.env.PORT : 3000}`)
})
