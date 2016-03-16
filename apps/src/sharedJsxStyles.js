/**
 * A place to share styles for use in inline jsx. There may be value in keeping
 * this in sync with some of our .scss files, in particular when it comes to
 * colors
 */

module.exports = {
  colors: {
    charcoal: '#5b6770',
    green: '#b9bf15',
    white: '#fff',
    orange: '#ffa400',
    teal: '#1abc9c',
    // colors that are taken from bootstrap, and not necessarily part of our
    // core theme
    bootstrap: {
      errorBackground: '#f2dede',
      errorText: '#b94a48',
      errorBorder: '#ebccd1',
      warningBackground: '#fcf8e3',
      warningText: '#c09853',
      warningBorder: '#faebcc',
    }
  }
};
