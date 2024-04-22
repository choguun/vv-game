import { IS_PRODUCTION } from '@/src/utils/secrets';

export function getCoreUrl() {
  return IS_PRODUCTION ? '' : 'http://54.254.240.216:4000';
}

export function getServerUrl() {
  return IS_PRODUCTION ? '' : 'http://localhost:8080';
}
