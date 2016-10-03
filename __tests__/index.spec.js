import fs from 'fs';

import isEqual from 'lodash.isequal';
import { transform } from 'babel-core';

const getTestFunction = (initial, expected) => () => {
  const { code: actual } = transform(initial, {
    plugins: ['./src/index.js']
  });

  const [actualAstWithoutNewLines, expectedAstWithoutNewLines] = [actual, expected].map(
    code => transform(code.replace(/\n/mg, '')).ast
  );

  if (isEqual(actualAstWithoutNewLines, expectedAstWithoutNewLines)) {
    expect(actualAstWithoutNewLines).toEqual(expectedAstWithoutNewLines);
  } else {
    expect(actual).toBe(expected);
  }
};

const testExamples = () => {
  const examplesDirectory = 'examples';
  fs.readdirSync(examplesDirectory)
    .filter(entry => !entry.startsWith('.'))
    .forEach((directoryName) => {
      const testName = `supports ${directoryName.replace(/-/g, ' ')}`;

      const [initial, expected] = ['initial', 'expected'].map((fileName) => {
        const filePath = `${examplesDirectory}/${directoryName}/${fileName}.js`;
        return fs.readFileSync(filePath).toString();
      });

      const testFunction = getTestFunction(initial, expected);

      if (directoryName.startsWith('only-')) {
        it.only(testName, testFunction);
      } else if (directoryName.startsWith('skip-')) {
        it.skip(testName, testFunction);
      } else {
        it(testName, testFunction);
      }
    });
};

const testReadme = () => {
  const readme = fs.readFileSync('README.md').toString();
  const parts = readme.split('```javascript');
  const [initial, expected] = [1, 2].map(index => parts[index].split('```')[0]);

  it('supports readme examples', getTestFunction(initial, expected));
};

testExamples();
testReadme();
