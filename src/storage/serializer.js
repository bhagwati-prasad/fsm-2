/**
 * Serializer
 * Handles JSON serialization and versioning
 */

import { Logger } from '../utils/logger';

export class Serializer {
  /**
   * Create a new serializer
   * @param {string} version - Schema version
   */
  constructor(version = '1.0.0') {
    this.logger = new Logger('Serializer');
    this.version = version;
    this.migrations = new Map();
  }

  /**
   * Serialize data to JSON
   * @param {Object} data - Data to serialize
   * @returns {string} - JSON string
   */
  serialize(data) {
    try {
      return JSON.stringify(
        {
          version: this.version,
          timestamp: new Date().toISOString(),
          data
        },
        null,
        2
      );
    } catch (error) {
      this.logger.error('Serialization failed', error);
      return null;
    }
  }

  /**
   * Deserialize JSON to data
   * @param {string} json - JSON string
   * @returns {Object} - Deserialized data
   */
  deserialize(json) {
    try {
      const parsed = JSON.parse(json);

      // Check version and migrate if needed
      if (parsed.version !== this.version) {
        return this.migrate(parsed);
      }

      return parsed.data;
    } catch (error) {
      this.logger.error('Deserialization failed', error);
      return null;
    }
  }

  /**
   * Register migration function
   * @param {string} fromVersion - Source version
   * @param {string} toVersion - Target version
   * @param {Function} migrationFn - Migration function
   */
  registerMigration(fromVersion, toVersion, migrationFn) {
    const key = `${fromVersion}->${toVersion}`;
    this.migrations.set(key, migrationFn);
  }

  /**
   * Migrate data to current version
   * @private
   * @param {Object} parsed - Parsed data with version
   * @returns {Object} - Migrated data
   */
  migrate(parsed) {
    let data = parsed.data;
    let currentVersion = parsed.version;

    while (currentVersion !== this.version) {
      const migrationKey = `${currentVersion}->${this.version}`;
      const migration = this.migrations.get(migrationKey);

      if (!migration) {
        this.logger.error(`No migration found from ${currentVersion} to ${this.version}`);
        return null;
      }

      try {
        data = migration(data);
        currentVersion = this.version;
      } catch (error) {
        this.logger.error(`Migration failed: ${migrationKey}`, error);
        return null;
      }
    }

    return data;
  }

  /**
   * Validate data against schema
   * @param {Object} data - Data to validate
   * @param {Object} schema - JSON schema
   * @returns {Object} - Validation result
   */
  validate(data, schema) {
    const errors = [];

    // Basic validation
    if (schema.type && typeof data !== schema.type) {
      errors.push(`Expected type ${schema.type}, got ${typeof data}`);
    }

    if (schema.required && Array.isArray(schema.required)) {
      schema.required.forEach((field) => {
        if (!(field in data)) {
          errors.push(`Missing required field: ${field}`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
