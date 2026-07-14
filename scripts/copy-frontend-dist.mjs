import { cpSync, existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const source = resolve('frontend', 'dist');
const target = resolve('dist');

if (!existsSync(source)) {
  throw new Error('frontend/dist was not created by the build');
}

rmSync(target, { recursive: true, force: true });
cpSync(source, target, { recursive: true });
