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
  const packages = [`react`, `react-dom`];
  const files = [];

  // Could do this recursively, keep it simple instead
  for (const package of packages) {
    const root = path.resolve(`node_modules`, package);
    const cjs = path.resolve(root, `cjs`);
    const umd = path.resolve(root, `umd`);

    for (const dir of [root, cjs, umd]) {
      const dirFiles = ((await fs.readdir(dir)) || []).filter(
        (file) => path.extname(file).toLowerCase() === `.js`
      );

      for (const dirFile of dirFiles) {
        files.push(path.resolve(dir, dirFile));
      }
    }
  }

  let errored = false;

  for (const file of files) {
    try {
      let content = (await fs.readFile(file)).toString();
      content = content.replace(
        new RegExp(`${fromString}`, `g`),
        `${toString}`
      );
      await fs.writeFile(file, content);
    } catch (error) {
      console.error(
        `\x1b[31m`,
        `Failed to replace "${fromString}" with "${toString}" in ${packages.join(
          ` and `
        )}\n\n`,
        `\x1b[0m`,
        error
      );

      errored = true;

      break;
    }
  }

  if (!errored) {
    console.info(
      `\x1b[32m`,
      `Successfully replaced "${fromString}" with "${toString}" in ${packages.join(
        ` and `
      )}`,
      `\x1b[0m`
    );
  }
}

main();
