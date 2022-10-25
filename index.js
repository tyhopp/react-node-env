#!/usr/bin/env node

const fs = require(`fs-extra`);
const path = require(`path`);

const args = process.argv.slice(2);

let revert = false;

for (const arg of args) {
  switch (arg) {
    case `--revert`:
      revert = true;
      break;
  }
}

const fromString = revert ? `REACT_NODE_ENV` : `NODE_ENV`;
const toString = revert ? `NODE_ENV` : `REACT_NODE_ENV`;

async function main() {
  const packages = [
    `react`,
    `react-dom`,
    `react-is`,
    `react-server-dom-webpack`,
    `scheduler`,
  ];
  const files = [];

  const adjustedPackages = new Set();

  // Could do this recursively, keep it simple instead
  for (const package of packages) {
    const root = path.resolve(`node_modules`, package);
    const cjs = path.resolve(root, `cjs`);
    const umd = path.resolve(root, `umd`);

    for (const dir of [root, cjs, umd]) {
      if (!fs.existsSync(dir)) {
        continue;
      }

      if (!adjustedPackages.has(package)) {
        adjustedPackages.add(package);
      }

      const dirFiles = ((await fs.readdir(dir)) || []).filter(
        (file) => path.extname(file).toLowerCase() === `.js`
      );

      for (const dirFile of dirFiles) {
        files.push(path.resolve(dir, dirFile));
      }
    }
  }

  const adjustedPackagesStringified = Array.from(adjustedPackages).join(`, `);

  for (const file of files) {
    try {
      let content = (await fs.readFile(file)).toString();
      content = content.replace(
        new RegExp(`${fromString}`, `g`),
        `${toString}`
      );
      await fs.writeFile(file, content);
    } catch (cause) {
      throw new Error(
        `Failed to replace ${fromString} with ${toString} in ${file}`,
        { cause }
      );
    }
  }

  if (!adjustedPackages.size) {
    console.info(`No packages were adjusted, is react installed?`);
    process.exit(0);
  }

  console.info(
    `Replaced ${fromString} with ${toString} in these packages:\n${adjustedPackagesStringified}`
  );
}

main();
