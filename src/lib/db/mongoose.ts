import mongoose from "mongoose";

// ─────────────────────────────────────────────────────────────
// Mongoose Connection (serverless-safe)
//
// Caches the connection on the Node.js global object so that
// hot-reloads in development and Vercel cold starts in production
// don't create redundant connections.
// ─────────────────────────────────────────────────────────────

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    // eslint-disable-next-line no-var
    var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
    conn: null,
    promise: null,
};

if (!global.mongooseCache) {
    global.mongooseCache = cached;
}

async function dbConnect(): Promise<typeof mongoose> {
    // Return existing connection immediately
    if (cached.conn) {
        return cached.conn;
    }

    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
        throw new Error(
            "Please define the MONGODB_URI environment variable in .env.local\n" +
            "Example: MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/pulselog"
        );
    }

    // Validate that the URI includes a database name
    if (
        MONGODB_URI.endsWith("/") ||
        MONGODB_URI.endsWith(".net") ||
        MONGODB_URI.endsWith(".net/")
    ) {
        console.warn(
            "[MongoDB] ⚠️  Your MONGODB_URI does not include a database name.\n" +
            "MongoDB will NOT create a database until a name is specified.\n" +
            "Fix: append the database name, e.g. mongodb+srv://...mongodb.net/pulselog"
        );
    }

    if (!cached.promise) {
        console.log("[MongoDB] Initiating new connection...");

        const opts: mongoose.ConnectOptions = {
            bufferCommands: false,
        };

        cached.promise = mongoose
            .connect(MONGODB_URI, opts)
            .then((mongooseInstance) => {
                console.log(
                    `[MongoDB] ✅ Connected successfully — db: "${mongooseInstance.connection.db?.databaseName}"`
                );
                return mongooseInstance;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        // Reset the promise so the next call retries from scratch
        cached.promise = null;
        console.error("[MongoDB] ❌ Connection failed:", error);
        throw error;
    }

    return cached.conn;
}

export default dbConnect;
