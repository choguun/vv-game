import { IS_PRODUCTION } from '@/src/utils/secrets';

export function getCoreUrl() {
  return IS_PRODUCTION ? '' : process.env.CORE_URI;
}

export function getServerUrl() {
  return IS_PRODUCTION ? '' : process.env.SERVER_URI;
}
