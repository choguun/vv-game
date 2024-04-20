import { IS_PRODUCTION } from '@/src/utils/secrets';

export function getCoreUrl() {
  return IS_PRODUCTION ? 'https://hi.shaoruu.io' : 'http://127.0.0.11:4000';
}

export function getServerUrl() {
  return IS_PRODUCTION ? 'https://hi.shaoruu.io' : 'http://localhost:8080';
}
