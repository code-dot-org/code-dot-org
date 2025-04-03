const assertions = {
  'bf-cache': 'off',
  'color-contrast': 'off',
  'inspector-issues': 'off',
  'offscreen-images': ['error', {minScore: 0.5, maxLength: 3}],
  'total-byte-weight': ['error', {minScore: 0.5}],
  'unused-css-rules': ['error', {maxLength: 5}],
  'unused-javascript': ['error', {maxLength: 10}],
  'uses-text-compression': ['error', {maxLength: 5}],
  'third-party-cookies': 'off',
  'uses-rel-preconnect': 'off',
  'link-text': 'off', // re-enable after CMS-497
};

if (process.env.STAGE !== 'production') {
  // Not crawlable in preprod
  assertions['is-crawlable'] = 'off';
}

module.exports = {
  ci: {
    assert: {
      preset: 'lighthouse:recommended',
      assertions,
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
