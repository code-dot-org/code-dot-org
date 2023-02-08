import Immutable from 'immutable';

/**
 * Given a search query, generate a results list of animationProps objects that
 * can be displayed and used to add an animation to the project.
 * @param {string} searchQuery - text entered by the user to find an animation
 * @param {string} categoryQuery - name of category user selected to filter animations
 * @param {object} assetLibrary - json content for soundLibrary or animationLibrary
 * @param {int} currentPage - current range of animations to display
 * @param {int} maxResults - max number of results to return in an array
 * @return {Array} - Limited list of assets from the library that match the search query.
 */
export function searchAssets(
  searchQuery,
  categoryQuery,
  assetLibrary,
  currentPage,
  maxResults
) {
  // Make sure to generate the search regex in advance, only once.
  // Search is case-insensitive
  // Match any word boundary or underscore followed by the search query.
  // Example: searchQuery "bar"
  //   Will match: "barbell", "foo-bar", "foo_bar" or "foo bar"
  //   Will not match: "foobar", "ubar"
  const searchRegExp = new RegExp('(?:\\s+|_|^|-)' + searchQuery, 'i');

  // Generate the set of all results associated with all matched aliases
  let resultSet = Object.keys(assetLibrary.aliases)
    .filter(alias => searchRegExp.test(alias))
    .reduce((resultSet, nextAlias) => {
      return resultSet.union(assetLibrary.aliases[nextAlias]);
    }, Immutable.Set());

  if (categoryQuery !== '' && categoryQuery !== 'all') {
    let categoryResultSet = Immutable.Set(
      assetLibrary.categories[categoryQuery]
    );
    if (searchQuery !== '') {
      resultSet = resultSet.intersect(categoryResultSet);
    } else {
      resultSet = categoryResultSet;
    }
  }

  // Finally alphabetize the results (for stability), take only the first
  // maxResults so we don't load too many images at once, and return
  // the associated metadata for each result.
  const results = resultSet
    .sort()
    .map(result => assetLibrary.metadata[result])
    .toArray();
  return {
    pageCount: Math.ceil(results.length / maxResults),
    results: results.slice(
      currentPage * maxResults,
      (currentPage + 1) * maxResults
    )
  };
}

export function filterOutBackgrounds(assets) {
  return assets.filter(
    animation => !animation.categories.includes('backgrounds')
  );
}
