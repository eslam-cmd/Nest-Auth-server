import { defineConfig } from "@prisma/config";

export default defineConfig({
  datasource: {
    url: "postgresql://neondb_owner:password@host:5432/neondb?sslmode=require",
  },
});