// Aspire TypeScript AppHost
// For more information, see: https://aspire.dev

import { createBuilder, refExpr } from './.aspire/modules/aspire.mjs';

const builder = await createBuilder();

const stackArgs = ["--label", "com.docker.compose.project=doc-semantic-search"];

const db = await builder.addContainer("db", "pgvector/pgvector:pg17")
    .withContainerName("doc-postgres")
    .withVolume("/var/lib/postgresql/data", { name: "doc-pg-data" })
    .withContainerRuntimeArgs(["--cpus=1.0", "--memory=512m", ...stackArgs])
    .withEnvironment("POSTGRES_USER", "postgres")
    .withEnvironment("POSTGRES_PASSWORD", "postgres")
    .withEnvironment("POSTGRES_DB", "app")
    .withEndpoint({
        name: "tcp",
        targetPort: 5432
    });

const pgadmin = await builder.addContainer("pgadmin", "dpage/pgadmin4:latest")
    .withContainerName("doc-pgadmin")
    .withVolume("/var/lib/pgadmin", { name: "doc-pgadmin-data" })
    .withBindMount("./servers.json", "/pgadmin4/servers.json", { isReadOnly: true })
    .withContainerRuntimeArgs(["--cpus=0.5", "--memory=256m", ...stackArgs])
    .withEnvironment("PGADMIN_DEFAULT_EMAIL", "admin@admin.com")
    .withEnvironment("PGADMIN_DEFAULT_PASSWORD", "admin")
    .withEnvironment("PGPASSFILE", "/tmp/.pgpass")
    .withEnvironment("PGADMIN_CONFIG_DESKTOP_USER", "\"admin@admin.com\"")
    .withEnvironment("PGADMIN_CONFIG_SERVER_MODE", "False")
    .withEnvironment("PGADMIN_CONFIG_MASTER_PASSWORD_REQUIRED", "False")
    .withHttpEndpoint({
        port: 5050,
        targetPort: 80,
        name: "http"
    })
    .withEntrypoint("/bin/sh")
    .withArgs(["-c", "echo '*:*:*:*:postgres' > /tmp/.pgpass && chmod 600 /tmp/.pgpass && exec /entrypoint.sh"])
    .waitFor(db);

const backend = await builder.addExecutable("backend", "uv", "../apps/backend", ["run", "fastapi", "dev", "src/app/main.py", "--port", "8484"])
    .withEnvironment("DATABASE_URL", refExpr`postgresql+asyncpg://postgres:postgres@${await db.getEndpoint("tcp")}/app`)
    .waitFor(db)
    .withHttpEndpoint({
        port: 8484,
        targetPort: 8484,
        env: "PORT",
        isProxied: false
    });

const frontend = await builder.addExecutable("frontend", "npm", "../apps/frontend", ["run", "dev"])
    .waitFor(backend)
    .withEnvironment("VITE_API_BASE_URL", "http://localhost:8484/api/v1")
    .withHttpEndpoint({
        port: 5115,
        targetPort: 5115,
        env: "PORT",
        isProxied: false
    });

await builder.build().run();
