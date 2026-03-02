import { apiGatewayCompositeDefinition } from './api-gateway';
import { dbClusterCompositeDefinition } from './db-cluster';
import { microserviceCompositeDefinition } from './microservice';

export const defaultCompositeDefinitions = [
  apiGatewayCompositeDefinition,
  dbClusterCompositeDefinition,
  microserviceCompositeDefinition,
];
