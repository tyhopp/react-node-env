const { test } = require(`uvu`);
const assert = require(`uvu/assert`);
const { execSync } = require(`child_process`);
const fs = require(`fs-extra`);
const path = require(`path`);

const fixtureDir = path.resolve(`tests/fixtures/revert`);

const fixture = {
  filePaths: [`react`, `react-dom`].flatMap((package) => [
    path.join(fixtureDir, `node_modules`, package, `index.js`),
    path.join(fixtureDir, `node_modules`, package, `cjs`, `index.js`),
    path.join(fixtureDir, `node_modules`, package, `umd`, `index.js`),
  ]),
  originalContent: `process.env.REACT_NODE_ENV = 'production';`,
  modifiedContent: `process.env.NODE_ENV = 'production';`,
};

test.after(() => {
  for (const filePath of fixture.filePaths) {
    fs.writeFileSync(filePath, fixture.originalContent);
  }
});

test(`should revert REACT_NODE_ENV to NODE_ENV in react and react-dom modules`, () => {
  execSync(`node ../../../index.js --revert`, {
    stdio: `inherit`,
    cwd: fixtureDir,
  });

  for (const filePath of fixture.filePaths) {
    const content = fs.readFileSync(filePath, `utf8`);
    assert.is(content, fixture.modifiedContent);
  }
});

test.run();
