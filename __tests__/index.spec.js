import fs from 'fs';
import path from 'path';

import _ from 'lodash';
import { transform } from 'babel-core';

const getTestFunction = (initial, expected) => () => {
  const { code: actual } = transform(initial, {
    plugins: ['./src/index.js']
  });

  const [actualAstWithoutNewLines, expectedAstWithoutNewLines] = [actual, expected].map(
    code => transform(code.replace(/\n/mg, '')).ast
  );

  if (_.isEqual(actualAstWithoutNewLines, expectedAstWithoutNewLines)) {
    expect(actualAstWithoutNewLines).toEqual(expectedAstWithoutNewLines);
  } else {
    expect(actual).toBe(expected);
  }
};

const testExamples = () => {
  const examplesDirectory = 'examples';
  fs.readdirSync(examplesDirectory).forEach((directoryName) => {
    const testName = `supports ${directoryName.replace(/-/g, ' ')}`;

    const [initial, expected] = ['initial', 'expected'].map((fileName) => {
      const filePath = `${examplesDirectory}/${directoryName}/${fileName}.js`;
      return fs.readFileSync(filePath).toString();
    });

    it(testName, getTestFunction(initial, expected));
  });
};

const testReadme = () => {
  const readme = fs.readFileSync('README.md').toString();
  const parts = readme.split('```');
  const [initial, expected] = [1, 3].map(index => parts[index].split('javascript')[1]);

  it('supports readme examples', getTestFunction(initial, expected));
};

testExamples();
testReadme();
