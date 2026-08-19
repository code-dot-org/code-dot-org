import * as viaPackage from '@code-dot-org/shared-constants';

import * as viaGeneratedScripts from '@cdo/generated-scripts/sharedConstants';

// The package reaches jest as CommonJS, which adds a `default` key that the
// generated file does not have. Compare the named constants only.
const namedConstants = namespace =>
  Object.fromEntries(
    Object.entries(namespace).filter(([name]) => name !== 'default')
  );

// The Ruby generator writes one file, and the shared-constants package commits
// it. apps reads it through two specifiers during the move, so both must give
// the same values. This test fails if apps cannot resolve the package, or if
// the two copies drift apart.
describe('sharedConstants', () => {
  it('gives the same values through both specifiers', () => {
    expect(viaPackage.SectionLoginType).toEqual(
      viaGeneratedScripts.SectionLoginType
    );
    expect(namedConstants(viaPackage)).toEqual(
      namedConstants(viaGeneratedScripts)
    );
  });
});
