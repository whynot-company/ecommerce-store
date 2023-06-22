import mongoose from "mongoose";

export function mongooseConnection() {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection.asPromise();
    } else {
        const uri = "mongodb+srv://ecommerce:rCsl3GXNym6lvAGv@cluster0.sf5f456.mongodb.net/test";
        return mongoose.connect(uri);
    }
}