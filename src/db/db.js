import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URL}`);
        console.log(`MongoDB connected: ${connectionInstance.connection.host}`);

    } catch (error) {
        console.error("erros connecting database", error)
        process.exit(1)
    }
}

export default connectDB;