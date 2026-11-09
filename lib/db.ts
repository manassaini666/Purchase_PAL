import { contractFromJson } from "@prisma/orm-sqlite/static";
import contractJson from "../prisma/schema.json";

// Helper to interact with your SQLite contract database
export const getDbConfig = () => {
  return contractFromJson(contractJson);
};