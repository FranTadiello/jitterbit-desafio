require('dotenv').config();

const app = require('./app');
const { connectDatabase } = require('./config/database');

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    await connectDatabase(process.env.MONGODB_URI);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

bootstrap();
