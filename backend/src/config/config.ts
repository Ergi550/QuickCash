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

    useMockData: process.env.USE_MOCK_DATA === 'true'
};

export default config;