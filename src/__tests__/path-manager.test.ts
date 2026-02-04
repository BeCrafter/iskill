import { PathManager } from '../core/path-manager';
import * as path from 'path';

describe('PathManager', () => {
  let pathManager: PathManager;

  beforeEach(() => {
    pathManager = new PathManager();
  });

  describe('resolvePath', () => {
    it('should resolve absolute paths', () => {
      const absolutePath = '/tmp/test';
      const resolved = pathManager.resolvePath(absolutePath);
      expect(resolved).toBe(absolutePath);
    });

    it('should resolve relative paths', () => {
      const relativePath = './test';
      const resolved = pathManager.resolvePath(relativePath);
      expect(resolved).toBe(path.resolve(process.cwd(), relativePath));
    });

    it('should normalize paths', () => {
      const messyPath = './test/../test/./sub';
      const resolved = pathManager.resolvePath(messyPath);
      expect(resolved).toBe(path.normalize(path.resolve(process.cwd(), messyPath)));
    });
  });

  describe('getDefaultPath', () => {
    it('should return default path', () => {
      const defaultPath = pathManager.getDefaultPath();
      expect(defaultPath).toBe('./skills');
    });
  });

  describe('getAllPaths', () => {
    it('should return default path when no paths provided', () => {
      const paths = pathManager.getAllPaths();
      expect(paths).toHaveLength(1);
      expect(paths[0]).toContain('skills');
    });

    it('should return resolved paths when provided', () => {
      const customPaths = ['./test1', './test2'];
      const paths = pathManager.getAllPaths(customPaths);
      expect(paths).toHaveLength(2);
      expect(paths[0]).toContain('test1');
      expect(paths[1]).toContain('test2');
    });
  });
});
