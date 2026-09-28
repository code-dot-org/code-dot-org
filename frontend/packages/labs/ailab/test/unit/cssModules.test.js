import fs from 'fs';
import path from 'path';
import * as sass from 'sass';

const SRC = path.join(__dirname, '../../src');

const componentsUsingModules = fs
  .readdirSync(SRC, {recursive: true})
  .filter(file => file.endsWith('.tsx'))
  .filter(file =>
    fs.readFileSync(path.join(SRC, file), 'utf8').includes(".module.scss'"),
  );

const definedClasses = new Map();

function classesDefinedIn(stylesheet) {
  if (!definedClasses.has(stylesheet)) {
    const {css} = sass.compile(stylesheet);
    definedClasses.set(
      stylesheet,
      new Set([...css.matchAll(/\.([a-zA-Z_][\w-]*)/g)].map(match => match[1])),
    );
  }
  return definedClasses.get(stylesheet);
}

function moduleReferences(component) {
  const source = fs.readFileSync(component, 'utf8');
  const body = source.replace(/^import .*$/gm, '');
  return [
    ...source.matchAll(/^import (\w+) from '(\.[^']*\.module\.scss)';$/gm),
  ].map(([, alias, stylesheet]) => ({
    stylesheet: path.resolve(path.dirname(component), stylesheet),
    classes: [
      ...new Set(
        [...body.matchAll(new RegExp(`\\b${alias}\\.(\\w+)`, 'g'))].map(
          match => match[1],
        ),
      ),
    ],
  }));
}

describe('CSS modules', () => {
  it.each(componentsUsingModules)(
    '%s references only classes its stylesheets define',
    component => {
      const undefinedClasses = moduleReferences(
        path.join(SRC, component),
      ).flatMap(({stylesheet, classes}) =>
        classes
          .filter(name => !classesDefinedIn(stylesheet).has(name))
          .map(name => `${path.basename(stylesheet)}: .${name}`),
      );

      expect(undefinedClasses).toEqual([]);
    },
  );
});
