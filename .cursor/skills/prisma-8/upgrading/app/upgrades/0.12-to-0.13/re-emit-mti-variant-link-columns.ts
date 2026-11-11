import { access, readdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

declare const projectRoot: string;
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next']);

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function findPrismaNextConfigDirs(root: string): Promise<string[]> {
  const out: string[] = [];

  async function walk(dir: string): Promise<void> {
    try {
      const entries = await readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          if (SKIP_DIRS.has(String(entry.name))) continue;
          await walk(join(dir, String(entry.name)));
        } else if (entry.isFile() && String(entry.name) === 'prisma.config.ts') {
          out.push(dir);
        }
      }
    } catch {
      return;
    }
  }

  await walk(root);
  return out.sort();
}

function contractJsonCandidates(configDir: string): string[] {
  return [
    join(configDir, 'src', 'contract.json'),
    join(configDir, 'src', 'prisma', 'contract.json'),
    join(configDir, 'prisma', 'contract.json'),
    join(configDir, 'contract.json'),
  ];
}

async function resolveContractJson(configDir: string): Promise<string | null> {
  for (const candidate of contractJsonCandidates(configDir)) {
    if (await pathExists(candidate)) return candidate;
  }
  return null;
}

/**
 * A contract needs the MTI link-column migration when any of its domain models
 * is an MTI variant (is a `base` reference) whose matching storage table
 * has no `primaryKey` - the pre-change shape that lacks the link column.
 */
function contractNeedsMtilinkColumns(raw: string): boolean {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return false;
  }
  if (!isJsonObject(parsed)) return false;

  const domain = parsed['domain'];
  const storage = parsed['storage'];
  if (!isJsonObject(domain) || !isJsonObject(storage)) return false;

  const domainNamespaces = domain['namespaces'];
  const storageNamespaces = storage['namespaces'];
  if (!isJsonObject(domainNamespaces) || !isJsonObject(storageNamespaces)) return false;

  for (const [nsKey, ns] of Object.entries(domainNamespaces)) {
    if (!isJsonObject(ns)) continue;
    const models = ns['models'];
    if (!isJsonObject(models)) continue;
    for (const model of Object.values(models)) {
      if (!isJsonObject(model)) continue;
      if (!isJsonObject(model['base'])) continue;
      if (!isJsonObject(model['variantStorage'])) continue;
      const variantStorage = model['variantStorage'];
      const tableName = variantStorage['table'];
      // The variant table's namespace defaults to the model's enclosing domain
      // namespace when `storage.namespace` is absent.
      const namespaceID =
        typeof variantStorage['namespace'] === 'string' ? variantStorage['namespace'] : nsKey;
      if (typeof tableName !== 'string') continue;
      const storageNs = storageNamespaces[namespaceID];
      if (!isJsonObject(storageNs)) continue;
      const tables = storageNs['tables'];
      if (!isJsonObject(tables)) continue;
      const table = tables[tableName];
      if (!isJsonObject(table)) continue;
      if (table['primaryKey'] === undefined || table['primaryKey'] === null) {
        return true;
      }
    }
  }
  return false;
}

async function packageJsonHasScript(dir: string, name: string): Promise<boolean> {
  const pkgPath = join(dir, 'package.json');
  if (!(await pathExists(pkgPath))) return false;
  const raw = await readFile(pkgPath, 'utf-8');
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return false;
  }
  if (!isJsonObject(parsed)) return false;
  const scripts = parsed['scripts'];
  if (!isJsonObject(scripts)) return false;
  const value = scripts[name];
  return typeof value === 'string' && value.length > 0;
}

async function resolveEmitInvocation(configDir: string): Promise<{
  readonly cwd: string;
  readonly args: string[];
  readonly key: string;
}> {
  let dir = configDir;
  while (dir.startsWith(projectRoot)) {
    if (await packageJsonHasScript(dir, 'emit')) {
      return { cwd: dir, args: ['emit'], key: `script:${dir}` };
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  const configPath = join(configDir, 'prisma.config.ts');
  return {
    cwd: projectRoot,
    args: ['exec', 'prisma-next', 'contract', 'emit', '--config', configPath],
    key: `config:${configPath}`,
  };
}

async function runEmit(configDir: string): Promise<void> {
  const { cwd, args } = await resolveEmitInvocation(configDir);
  await execFileAsync('pnpm', args, { cwd, env: process.env });
}

(async () => {
  const configDirs = await findPrismaNextConfigDirs(projectRoot);
  const emitKeys = new Set<string>();
  const targets: Array<{ configDir: string; contractPath: string }> = [];

  for (const configDir of configDirs) {
    if (await packageJsonHasScript(configDir, 'build:contract-space')) continue;
    const contractPath = await resolveContractJson(configDir);
    if (contractPath === null) continue;
    const raw = await readFile(contractPath, 'utf-8');
    if (!contractNeedsMtilinkColumns(raw)) continue;
    const emitInvocation = await resolveEmitInvocation(configDir);
    if (emitKeys.has(emitInvocation.key)) continue;
    emitKeys.add(emitInvocation.key);
    targets.push({ configDir, contractPath });
  }
})();