import { config } from 'dotenv';

let isEnvironmentLoaded = false;

export function loadEnvironment() {
  if (isEnvironmentLoaded) {
    return;
  }

  config({ path: ['.env', '../.env'] });
  isEnvironmentLoaded = true;
}

loadEnvironment();
