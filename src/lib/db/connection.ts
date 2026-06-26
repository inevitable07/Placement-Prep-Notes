/**
 * @file connection.ts
 * @description Establishes a cached MongoDB connection singleton using Mongoose.
 * In Next.js, hot-reloading in development causes modules to re-evaluate, 
 * which can create multiple connection pools. Caching the connection on a global
 * object prevents Mongoose from opening multiple connections to the database.
 */

import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var mongooseConnection: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

// Initialize the connection cache globally if not already set
if (!global.mongooseConnection) {
  global.mongooseConnection = {
    conn: null,
    promise: null,
  };
}

const cached = global.mongooseConnection;

/**
 * Connects to MongoDB database using Mongoose and caches the connection instance.
 * 
 * @returns {Promise<typeof mongoose>} The active Mongoose connection instance.
 * @throws {Error} If MONGODB_URI environment variable is missing.
 */
export default async function connectDB(): Promise<typeof mongoose> {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error("[MongoDB] MONGODB_URI environment variable is not set");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: "placement-prep-ai",
    };

    // Bind MongoDB connection event listeners to track connection state
    mongoose.connection.on("connected", () => console.log("[MongoDB] Connected"));
    mongoose.connection.on("error", (err) => console.error("[MongoDB] Error:", err));
    mongoose.connection.on("disconnected", () => console.warn("[MongoDB] Disconnected"));

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      cached.conn = mongooseInstance;
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
