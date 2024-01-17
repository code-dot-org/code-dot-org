/**
 * Returns true if record matches the given search parameters, which are a map
 * from key name to expected value.
 */
function matchesSearch(record, searchParams) {
  let matches = true;
  Object.keys(searchParams || {}).forEach(key => {
    matches = matches && record[key] === searchParams[key];
  });
  return matches;
}

export function filterRecords(recordMap, searchParams) {
  let records = [];
  Object.keys(recordMap).forEach(id => {
    let record = JSON.parse(recordMap[id]);
    if (matchesSearch(record, searchParams)) {
      records.push(record);
    }
  });
  return records;
}
