import { computeDefinition } from './compute';
import { databaseDefinition } from './database';
import { messagingDefinition } from './messaging';
import { networkDefinition } from './network';

export const defaultComponentDefinitions = [
  computeDefinition,
  databaseDefinition,
  messagingDefinition,
  networkDefinition,
];
