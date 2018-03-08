/* eslint-disable no-console */
import express from 'express';
import graphqlHTTP from 'express-graphql';
import chalk from 'chalk';

import schema from './graphql/schema';
import postgrePool from './postgre';

require('dotenv').config();

const app = express();
require('./config/configure-express')(app);

const start = async () => {
  const pgPool = await postgrePool();
  console.log(chalk.yellowBright('pgPool', Object.keys(pgPool)));
  await pgPool.sequelize.sync();

  app.use(
    '/graphql',
    graphqlHTTP(request => {
      const startTime = Date.now();

      return {
        schema: schema,
        context: {
          user: request.user,
          pgPool: pgPool
        },
        graphiql: true,

        /* eslint-disable-next-line no-unused-vars */
        extensions: ({ document, variables, operationName, result }) => ({
          timing: (Date.now() - startTime).toString() + 'ms',
        })
      };
    })
  );

  app.listen(app.get('port'), () => {
    console.log(chalk.greenBright(`Server is now up @ ${app.get('host')}:${app.get('port')}`));
  });

};
start();
