import { createBuilder, refExpr } from './.aspire/modules/aspire.mjs';

const builder = await createBuilder();
const db = builder.addContainer("db", "pgvector/pgvector:pg17").withEndpoint({name: "tcp", targetPort: 5432});
const ep = await db.getEndpoint("tcp");
console.log(Object.getOwnPropertyNames(ep));
console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(ep)));
