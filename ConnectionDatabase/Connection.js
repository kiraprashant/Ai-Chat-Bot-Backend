const mongoose = require("mongoose")
require('dotenv').config()

const url = process.env.DB_URL

const connectDB = () =>{
    console.log("Attempting to connect to the database...")
    mongoose.connect(url,{
        //useNewUrlParser: true,
        //ssl: true,
        writeConcern: { w: 'majority' },
    }).then(()=>{
        console.log("Mongo URI:", url)
        console.log("Connected to the database successfully." , mongoose.connection.name)
    }).catch((e)=>{
        console.error("Error connecting to the database:", e)
        console.log("Connection failed.")
    })
}

// mongodb+srv://prashantnair1999:wlKbBukyFw0Eb638@prashantapi.saxl0go.mongodb.net/ShopingCart
// "mongodb+srv://prashantnair1999:wlKbBukyFw0Eb638@prashantapi.saxl0go.mongodb.net/ShopingCart?retryWrites=true&w=majority"


module.exports = connectDB