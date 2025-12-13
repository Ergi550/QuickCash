import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/config';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Import routes (will be created next)
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
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
    }

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'QuickCash API is running',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv
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
    this.app.use(`${apiPrefix}/orders`, orderRoutes);
    this.app.use(`${apiPrefix}/payments`, paymentRoutes);

    // API root
    this.app.get(apiPrefix, (req, res) => {
      res.json({
        success: true,
        message: 'QuickCash API v1',
        endpoints: {
          auth: `${apiPrefix}/auth`,
          products: `${apiPrefix}/products`,
          orders: `${apiPrefix}/orders`,
          payments: `${apiPrefix}/payments`
        }
      });
    });
  }

  /**
   * Initialize error handling
   */
  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);
    
    // Global error handler
    this.app.use(errorHandler);
  }

  /**
   * Start the server
   */
  public listen(): void {
    this.app.listen(config.port, () => {
      console.log('=================================');
      console.log(`🚀 QuickCash API Server Started`);
      console.log(`📡 Port: ${config.port}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`⏰ Time: ${new Date().toISOString()}`);
      console.log('=================================');
    });
  }
}

// Create and start server
const app = new App();
app.listen();

export default app;