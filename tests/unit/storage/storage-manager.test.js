/**
 * Storage Manager unit tests
 */

import { StorageManager } from '../../../src/storage/storage-manager';
import { LocalStorageDriver } from '../../../src/storage/drivers/local-storage';
import { SessionStorageDriver } from '../../../src/storage/drivers/session-storage';

describe('StorageManager', () => {
  let manager;
  let localDriver;
  let sessionDriver;

  beforeEach(() => {
    localDriver = new LocalStorageDriver();
    sessionDriver = new SessionStorageDriver();

    manager = new StorageManager({
      drivers: {
        local: localDriver,
        session: sessionDriver
      },
      defaultDriver: 'local'
    });
  });

  test('should register driver', () => {
    const driver = {};
    manager.registerDriver('custom', driver);
    expect(manager.getDriver('custom')).toBe(driver);
  });

  test('should get default driver', () => {
    expect(manager.getDriver()).toBe(localDriver);
  });

  test('should save data', async () => {
    const result = await manager.save('test-key', { data: 'test' });
    expect(result.status).toBe('success');
  });

  test('should load data', async () => {
    await manager.save('test-key', { data: 'test' });
    const data = await manager.load('test-key');
    expect(data.data).toBe('test');
  });

  test('should delete data', async () => {
    await manager.save('test-key', { data: 'test' });
    const result = await manager.delete('test-key');
    expect(result.status).toBe('success');
  });

  test('should track pending sync', async () => {
    await manager.save('test-key', { data: 'test' }, 'rest');
    expect(manager.getPendingSyncCount()).toBeGreaterThan(0);
  });

  test('should clear pending sync', () => {
    manager.clearPendingSync();
    expect(manager.getPendingSyncCount()).toBe(0);
  });
});
