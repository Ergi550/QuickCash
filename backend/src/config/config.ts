import dotenv from 'dotenv';
import type{Secret,SignOptions} from 'jsonwebtoken';

dotenv.config();

export const config = {
    port : process.env.PORT||3000,
    nodeEnv:process.env.NODE_ENV||'development',

    jwt:{
        secret:process.env.JWT_SECRET || 'default-secret-key-change-me',
        expiresIn:process.env.JWT_EXPIRES_IN || '24h'
    } as {
        secret : Secret;
        expiresIn:SignOptions['expiresIn']; //as{ } Kodi i shtuar nga chat
    },

    cors:{
            origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:4200'],
                credentials: true
    },
    database:{
        host: process.env.DB_HOST || 'localhost',
        port : parseInt(process.env.DB_PORT || '5432',10),
        database : process.env.DB_NAME ||'quickcash_db',
        user : process.env.DB_USER || 'postgres',
        password : process.env.DB_PASSWORD || 'Ergi10',
        max:20, // max number of clients in the pool
        idleTimeoutMillis:30000, // close idle clients after 30 seconds
        connectionTimeoutMillis:2000, // return an error after 2 seconds if connection could not be established  
    },

    useMockData: process.env.USE_MOCK_DATA === 'true',
    taxRate: parseFloat(process.env.TAX_RATE || '0.1'), // Add this line
};

export default config;