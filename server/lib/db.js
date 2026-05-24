import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.warn("MONGODB_URI is not set; skipping database connection.");
      return;
    }
    mongoose.connection.on("connected", () => {
      console.log("Mongoose connected to DB Cluster");
    });
    const connectionString =
      mongoUri.startsWith("mongodb://") || mongoUri.startsWith("mongodb+srv://")
        ? `${mongoUri}/ChatApp`
        : mongoUri;
    await mongoose.connect(connectionString);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.log("MongoDB connection failed:", error);
  }
};
