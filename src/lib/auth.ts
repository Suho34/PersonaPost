import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

// We use a native MongoClient for Better Auth's adapter
// This is separate from our Mongoose connection but points to the same DB
const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db(); // Connects to the database defined in the URI

export const auth = betterAuth({
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true, // Useful for testing, though we'll focus on Google
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  // Better Auth automatically handles schemas, but we will use Mongoose
  // for our own data (Posts, Vectors) later.
});
