import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/config';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { testConnection } from './database/Connection';

// Import routes
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/category.routes';
import orderRoutes from './routes/order.routes';
import paymentRoutes from './routes/payment.routes';

/**
 * QuickCash POS System - Main Application
 */
class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize middleware
   */
  private initializeMiddlewares(): void {
    // Security
    this.app.use(helmet());

    // CORS
    this.app.use(cors(config.cors));

    // Body parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Logging
    if (config.nodeEnv === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    // Health check endpoint
    this.app.get('/health', async (req, res) => {
      const dbConnected = await testConnection().catch(() => false);
      
      res.status(dbConnected ? 200 : 503).json({
        success: dbConnected,
        message: dbConnected ? 'QuickCash API is running' : 'Database connection failed',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
        database: dbConnected ? 'connected' : 'disconnected',
      });
    });
  }

  /**
   * Initialize routes
   */
  private initializeRoutes(): void {
    const apiPrefix = '/api/v1';

    // Mount routes
    this.app.use(`${apiPrefix}/auth`, authRoutes);
    this.app.use(`${apiPrefix}/products`, productRoutes);
    this.app.use(`${apiPrefix}/categories`, categoryRoutes);
    this.app.use(`${apiPrefix}/orders`, orderRoutes);
    this.app.use(`${apiPrefix}/payments`, paymentRoutes);

    // API root
    this.app.get(apiPrefix, (req, res) => {
      res.json({
        success: true,
        message: 'QuickCash POS API v1',
        version: '1.0.0',
        endpoints: {
          auth: `${apiPrefix}/auth`,
          products: `${apiPrefix}/products`,
          categories: `${apiPrefix}/categories`,
          orders: `${apiPrefix}/orders`,
          payments: `${apiPrefix}/payments`,
        },
      });
    });

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Mirë se vini në QuickCash POS System',
        api: '/api/v1',
        health: '/health',
      });
    });
  }

  /**
   * Initialize error handling
   */
  private initializeErrorHandling(): void {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  /**
   * Start the server
   */
  public async listen(): Promise<void> {
    console.log('\n🔌 Duke testuar lidhjen me databazën...');
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error('❌ Dështoi lidhja me databazën. Kontrollo konfigurimin.');
      console.log('\n📝 Sigurohu që:');
      console.log('   1. PostgreSQL është duke punuar');
      console.log('   2. Kredencialet në .env janë të sakta');
      console.log('   3. Databaza ekziston\n');
      process.exit(1);
    }

    this.app.listen(config.port, () => {
      console.log('\n=================================');
      console.log('🚀 QuickCash POS API Server');
      console.log('=================================');
      console.log(`📡 Port: ${config.port}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`🗄️  Database: E lidhur`);
      console.log(`⏰ Koha: ${new Date().toISOString()}`);
      console.log('=================================');
      console.log(`\n📌 API URL: http://localhost:${config.port}/api/v1`);
      console.log(`📌 Health: http://localhost:${config.port}/health\n`);
    });
  }
}

const app = new App();
app.listen();

export default app;