import * as fs from 'fs-extra';
import * as path from 'path';

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readFile(filePath: string): Promise<string> {
  return await fs.readFile(filePath, 'utf-8');
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf-8');
}

export async function copyFile(source: string, target: string): Promise<void> {
  await fs.ensureDir(path.dirname(target));
  await fs.copy(source, target, { overwrite: true });
}

export async function copyDir(source: string, target: string): Promise<void> {
  await fs.ensureDir(path.dirname(target));
  await fs.copy(source, target, { overwrite: true });
}

export async function removeFile(filePath: string): Promise<void> {
  await fs.remove(filePath);
}

export async function removeDir(dirPath: string): Promise<void> {
  await fs.remove(dirPath);
}

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

export async function isDirectory(filePath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(filePath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

export async function listFiles(dirPath: string): Promise<string[]> {
  return await fs.readdir(dirPath);
}

export function resolvePath(...paths: string[]): string {
  return path.resolve(...paths);
}

export function joinPath(...paths: string[]): string {
  return path.join(...paths);
}

export function getBasename(filePath: string): string {
  return path.basename(filePath);
}

export function getDirname(filePath: string): string {
  return path.dirname(filePath);
}

export function isAbsolute(filePath: string): boolean {
  return path.isAbsolute(filePath);
}

export function normalizePath(filePath: string): string {
  return path.normalize(filePath);
}
