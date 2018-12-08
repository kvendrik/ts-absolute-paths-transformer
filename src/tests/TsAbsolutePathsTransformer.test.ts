/* eslint-disable import/no-extraneous-dependencies */

import {resolve} from 'path';
import {cp, rm, mkdir} from 'shelljs';
import {readFileSync} from 'fs';
import TsAbsolutePathsTransformer from '../TsAbsolutePathsTransformer';

const FIXTURE_PATH = resolve(__dirname, '.test-fixture');

describe('TsAbsolutePathsTransformer', () => {
  beforeEach(() => {
    mkdir(FIXTURE_PATH);
  });

  afterEach(() => {
    rm('-rf', FIXTURE_PATH);
  });

  it('transforms basic import paths', async () => {
    useFixture('basic');

    const transformer = new TsAbsolutePathsTransformer({
      src: FIXTURE_PATH,
      isAbsoluteModule(path: string) {
        return path.startsWith('utilities');
      },
      resolveAbsoluteModule(modulePath: string) {
        return resolve(FIXTURE_PATH, modulePath);
      },
    });

    await transformer.transformAndSave();

    const newIndexContents = getFixtureContents('index.ts');
    expect(newIndexContents).toContain('./utilities/dog');
  });

  it('transforms deeply nested import paths', async () => {
    useFixture('basic');

    const transformer = new TsAbsolutePathsTransformer({
      src: FIXTURE_PATH,
      isAbsoluteModule(path: string) {
        return path.startsWith('utilities');
      },
      resolveAbsoluteModule(modulePath: string) {
        return resolve(FIXTURE_PATH, modulePath);
      },
    });

    await transformer.transformAndSave();

    const newPageContents = getFixtureContents('components/Page/Page.ts');
    expect(newPageContents).toContain('../../utilities/dog');
  });

  it('transforms deeply nested export paths', async () => {
    useFixture('basic');

    const transformer = new TsAbsolutePathsTransformer({
      src: FIXTURE_PATH,
      isAbsoluteModule(path: string) {
        return path.startsWith('utilities');
      },
      resolveAbsoluteModule(modulePath: string) {
        return resolve(FIXTURE_PATH, modulePath);
      },
    });

    await transformer.transformAndSave();

    const newPageContents = getFixtureContents('components/Page/index.ts');
    expect(newPageContents).toContain('../../utilities/dog');
  });

  it('skips non-module paths', async () => {
    useFixture('basic');

    let askedToResolvePath = false;

    const transformer = new TsAbsolutePathsTransformer({
      src: FIXTURE_PATH,
      isAbsoluteModule() {
        return false;
      },
      resolveAbsoluteModule() {
        askedToResolvePath = true;
        return '';
      },
    });

    await transformer.transformAndSave();
    expect(askedToResolvePath).toBeFalsy();
  });
});

function useFixture(name: string) {
  cp('-R', resolve(__dirname, `fixtures/${name}/*`), FIXTURE_PATH);
}

function getFixtureContents(filePath: string) {
  return readFileSync(resolve(FIXTURE_PATH, filePath), 'utf-8');
}
