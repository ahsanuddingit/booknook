import fs from "node:fs";
import pkg from "mongodb";
const { MongoClient } = pkg;

const uri = fs
  .readFileSync(".env", "utf8")
  .match(/^MONGODB_URI\s*=\s*(.+)$/m)[1]
  .trim();

const TEST_USER_ID = "6aeb8e91a3809e79077b014c";

const client = new MongoClient(uri);
await client.connect();
const db = client.db("booknook-User");

const found = await db.collection("account").findOne(
  { userId: TEST_USER_ID },
  { projection: { userId: 1, _id: 0 } }
);
console.log("found test account:", JSON.stringify(found));

const del = await db.collection("account").deleteOne({
  _id: new client.ObjectId
    ? new client.ObjectId("6aeb8e91a3809e79077b014d")
    : null,
});
console.log("deleted by _id (ObjectId):", del.deletedCount);

const rest = await db.collection("account").find({}, { projection: { userId: 1, _id: 1 } }).toArray();
console.log("remaining account docs:", JSON.stringify(rest.map((d) => ({ _id: d._id?.toString(), userId: d.userId?.toString?.() ?? String(d.userId) }))));
await client.close();
