// Importing and initializing dotenv
import dotenv from 'dotenv';
dotenv.config();

// Defining the type for your configuration for better type-checking
interface Config {
  STRIPE_SECRET_KEY: string;
  OPENAI_KEY: string;
  COINMARKETCAP_API_KEY: string;
}

// Assigning environment variables to constants with type assertion for safety
const config: Config = {
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  OPENAI_KEY: process.env.OPENAI_KEY || '',
  COINMARKETCAP_API_KEY: process.env.COINMARKETCAP_API_KEY || '',
};

// Exporting the config object
export default config;
