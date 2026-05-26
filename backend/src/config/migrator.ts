import { Umzug, SequelizeStorage } from 'umzug';
import sequelize from './database';
import { logger } from '../utils/logger';

export const migrator = new Umzug({
  migrations: {
    glob: ['../migrations/*.ts', { cwd: __dirname }],
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: {
    info: (msg) => logger.info(msg),
    warn: (msg) => logger.warn(msg),
    error: (msg) => logger.error(msg),
    debug: (msg) => logger.debug(msg),
  },
});

export type Migration = typeof migrator._types.migration;

// Run migrations when executed directly
if (require.main === module) {
  migrator
    .up()
    .then(() => {
      logger.info('✅ All migrations completed successfully');
      process.exit(0);
    })
    .catch((err) => {
      logger.error('❌ Migration failed:', err);
      process.exit(1);
    });
}
