import express, { json } from 'express';
import { routes } from './routes';

const PORT = process.env.PORT || 3000;
const app = express();


(async () => {
  try {
    app.use(json());
    app.use(routes);
    app.listen(PORT, async () => {
      console.log(`Server Started and Listening on PORT ${PORT} `);
    });
  } catch (err) {
    console.log('Error in starting the server', err);
  }
})();