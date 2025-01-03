import "dotenv/config";

const constants = {
  NODE_ENV: process.env.NODE_ENV,
  MONGO_PATH: process.env.MONGO_PATH,
  PORT: process.env.PORT,
  SECUREPORT: process.env.SECUREPORT,
  JWT_KEY: process.env.JWT_KEY,
  MJ_APIKEY_PUBLIC: process.env.MJ_APIKEY_PUBLIC,
  MJ_APIKEY_PRIVATE: process.env.MJ_APIKEY_PRIVATE,
  PG_MERCHANT_ID: process.env.PG_MERCHANT_ID || "",
  PG_API_KEY: process.env.PG_API_KEY || "",
  PG_SECRET_KEY: process.env.PG_SECRET_KEY,
  PG_BASE_URL: process.env.PG_BASE_URL,
};

export default constants;
