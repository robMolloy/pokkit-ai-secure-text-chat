#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const { spawn } = require("child_process");
const fse = require("fs-extra");

const basePath = __dirname;

const copyDir = async (sourceDir, destDir) => {
  try {
    await fse.ensureDir(destDir);

    await fse.copy(sourceDir, destDir, { overwrite: true });

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

async function deleteDirIfExists(dirPath) {
  try {
    const exists = await fse.pathExists(dirPath);

    if (exists) await fse.remove(dirPath);

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

const createTimestamp = () => new Date().toISOString();

const seedDir = `${basePath}/pb_data_backup/seed`;
const spawnDir = `${basePath}/pb_data`;

const main = async () => {
  await deleteDirIfExists(spawnDir);
  await copyDir(seedDir, spawnDir);

  const pocketbase = spawn(`${basePath}/pocketbase`, ["serve"], {
    stdio: "inherit",
    env: { ...process.env, FORCE_COLOR: "true" },
  });

  process.on("SIGINT", async () => {
    pocketbase.kill("SIGINT");
  });

  pocketbase.on("close", async () => {
    const newDir = `${basePath}/pb_data_backup/caches/${createTimestamp()}`;
    await copyDir(spawnDir, newDir);
    await deleteDirIfExists(spawnDir);
    process.exit(0);
  });
};
main();
