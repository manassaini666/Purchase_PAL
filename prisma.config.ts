import { definePrismaConfig } from "@prisma/cli-engine";
import * as fs from "fs";

export default definePrismaConfig({
  orm: {
    contract: {
      source: {
        format: "psl",
        path: ".agents/skills/prisma/schema.prisma",
        load: async () => {
          const engine = require("@prisma/cli-engine");
          const text = fs.readFileSync(".agents/skills/prisma/schema.prisma", "utf8");

          if (typeof engine.ok === "function") {
            return engine.ok({ text });
          }
          return { tag: "ok", value: { text } };
        },
      },
      output: ".agents/skills/prisma/contract.json",
    },
    adapter: {
      kind: "adapter",
      id: "sqlite",
      familyId: "sqlite",
      targetId: "sqlite",
      version: "1.0.0",
      create: () => {},
    },
    family: {
      kind: "family",
      id: "sqlite",
      familyId: "sqlite",
      version: "1.0.0",
      emission: {},
      create: () => {},
    },
    target: {
      kind: "target",
      id: "sqlite",
      familyId: "sqlite",
      targetId: "sqlite",
      version: "1.0.0",
      create: () => {},
    },
  },
});