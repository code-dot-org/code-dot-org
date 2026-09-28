import fs from 'fs';

function uniqueWithPrefix(names, prefix) {
  return [...new Set(names.filter(name => name.startsWith(prefix)))].sort();
}

export function cssVariablesRead(stylesheets, prefix) {
  const names = stylesheets.flatMap(stylesheet =>
    [...fs.readFileSync(stylesheet, 'utf8').matchAll(/var\((--[\w-]+)/g)].map(
      match => match[1],
    ),
  );
  return uniqueWithPrefix(names, prefix);
}

export function cssVariablesSet(element, prefix) {
  const names = element
    .getAttribute('style')
    .split(';')
    .map(rule => rule.split(':')[0].trim());
  return uniqueWithPrefix(names, prefix);
}
