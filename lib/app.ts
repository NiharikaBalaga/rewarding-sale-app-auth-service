import express, { json } from 'express';
import { routes } from './routes';
import * as process from 'process';
import * as mongoose from 'mongoose';

// TODO update into .env file later
const DB_ENDPOINT = 'mongodb://authService:authService@mongodb_auth_service:27017';
console.log('DB_ENDPOINT', DB_ENDPOINT);
const PORT = process.env.PORT || 3000;
const app = express();
app.use(json());
app.use(routes);


(async () => {
  try {
    await mongoose.connect(DB_ENDPOINT, {
      dbName: 'authDB'
    });

    console.log('Connected to Mongodb successfully');
    app.listen(PORT, async () => {
      console.log(`Server Started and Listening on PORT ${PORT} `);
    });
  } catch (err) {
    console.log('Error in starting the server', err);
  }
})();