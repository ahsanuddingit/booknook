import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db("booknook-User");

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
    emailAndPassword: { 
    enabled: true, 
  }, 
  // Signs short-lived JWTs for the Express API. The public key is published at
  // /api/auth/jwks, which the Express server verifies against via `jose`.
  plugins: [jwt()],
});