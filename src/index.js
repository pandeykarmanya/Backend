import dotenv from 'dotenv';
dotenv.config({
    path: './.env'
});

import connectDB from './db/db.js';
import app from './app.js';

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000)
    console.log(`Server is running on port ${process.env.PORT}`);
})

.catch((error) => {
    console.log("MONGO-DB CONNECTION FAILED", error);
});


