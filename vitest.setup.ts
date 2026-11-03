import { loadEnvConfig } from "@next/env"

// Vitest runs with NODE_ENV=test, so this loads .env.test.local, .env.test
// and .env, never .env.local. The dev database URL cannot leak into tests.
loadEnvConfig(process.cwd())
