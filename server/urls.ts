import { IS_PRODUCTION } from '@/src/utils/secrets';

export function getCoreUrl() {
  return IS_PRODUCTION ? '' : 'http://127.0.0.11:4000';
}

export function getServerUrl() {
  return IS_PRODUCTION ? '' : 'http://localhost:8080';
}
