/* eslint-disable import/no-extraneous-dependencies */

/**
 * A simple build script that builds a TypeScript project
 * that relies on absolute imports using a tsconfig baseUrl.
 *
 * It does the following:
 * 1. Copies the source into a build-intermediate/ folder.
 * 2. Converts absolute paths in the TypeScript files to relative ones using TsAbsolutePathsTransformer.
 * 3. Uses tsc to build the project into build/ from build-intermediate/.
 */

const {execSync} = require('child_process');
const {resolve} = require('path');
const {readdirSync} = require('fs');
const {rm, cp, mkdir} = require('shelljs');
const TsAbsolutePathsTransformer = require('..').default;
const {
  compilerOptions: {baseUrl},
} = require('./tsconfig.json');

const SRC_PATH = resolve(__dirname, baseUrl);
const BUILD_INTERMEDIATE_PATH = resolve(__dirname, 'build-intermediate');
const BUILD_PATH = resolve(__dirname, 'build');

const moduleOptions = readdirSync(SRC_PATH).map(filename =>
  filename.replace(/\.tsx?/, ''),
);

rm('-rf', BUILD_INTERMEDIATE_PATH);
rm('-rf', BUILD_PATH);

mkdir(BUILD_INTERMEDIATE_PATH);
cp('-R', `${SRC_PATH}/*`, BUILD_INTERMEDIATE_PATH);

const transformer = new TsAbsolutePathsTransformer({
  src: BUILD_INTERMEDIATE_PATH,
  isAbsoluteModule(path) {
    const moduleName = path.split('/')[0];
    return moduleOptions.includes(moduleName);
  },
  resolveAbsoluteModule(path) {
    return resolve(BUILD_INTERMEDIATE_PATH, path);
  },
});

transformer.transformAndSave().then(() => {
  execSync(
    `../node_modules/.bin/tsc --project tsconfig.build.json --outDir ${BUILD_PATH}`,
    {
      stdio: 'inherit',
    },
  );
});
