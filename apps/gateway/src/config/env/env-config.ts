import { local } from './local';
import { production } from './production';

const ENV = {
  LOCAL: 'local',
  PRODUCTION: 'production',
};

export const envConfig = () => {
  switch (process.env.NODE_ENV) {
    case ENV.LOCAL:
    case 'test':
      return local;
    case ENV.PRODUCTION:
      return production;
    default:
      return production;
  }
};
