import {assert} from '../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

const {
  canonicalCycle,
  isKnownCycle,
  resolveBundler,
} = require('../../bundlerBase');

describe('bundlerBase', function () {
  describe('canonicalCycle', function () {
    it('is rotation-insensitive', function () {
      // webpack enumerates a cycle once per member module; rspack
      // reports one arbitrary rotation.  All rotations must agree.
      assert.equal(
        canonicalCycle(['b', 'c', 'a', 'b']),
        canonicalCycle(['a', 'b', 'c', 'a'])
      );
      assert.equal(
        canonicalCycle(['c', 'a', 'b', 'c']),
        canonicalCycle(['a', 'b', 'c', 'a'])
      );
    });

    it('keeps the loop closed and starts at the smallest member', function () {
      assert.equal(canonicalCycle(['b', 'a', 'b']), 'a -> b -> a');
    });

    it('distinguishes different cycles over the same modules', function () {
      // a->b->c->a and a->c->b->a are different loops.
      assert.notEqual(
        canonicalCycle(['a', 'b', 'c', 'a']),
        canonicalCycle(['a', 'c', 'b', 'a'])
      );
    });
  });

  describe('isKnownCycle', function () {
    it('recognizes every allowlist entry in any rotation', function () {
      const entries = require('../../circular_dependencies.json');
      for (const entry of entries) {
        const paths = entry.split(' -> ');
        // rotate by one and re-close, simulating a detector that picked
        // a different starting module
        const ring = paths.slice(0, -1);
        const rotated = ring.slice(1).concat(ring[0]);
        rotated.push(rotated[0]);
        assert.isTrue(
          isKnownCycle(rotated),
          `rotation of allowlist entry not recognized: ${entry}`
        );
      }
    });

    it('recognizes a different decomposition of a known tangle', function () {
      // Detectors slice the same strongly-connected modules into
      // different simple cycles; a loop whose members are all already
      // known-cyclic is the same debt.  These applab modules appear in
      // several allowlist entries, but never in this exact loop.
      assert.isTrue(
        isKnownCycle([
          'src/applab/designMode.js',
          'src/applab/designElements/library.js',
          'src/applab/DesignWorkspace.jsx',
          'src/applab/designMode.js',
        ])
      );
    });

    it('flags a cycle that touches a module new to cycling', function () {
      assert.isFalse(
        isKnownCycle([
          'src/applab/designMode.js',
          'src/util/definitely-not-in-any-cycle.js',
          'src/applab/designMode.js',
        ])
      );
    });
  });
  describe('resolveBundler', function () {
    it('defaults to webpack', function () {
      // rspack is opt-in.  The default was flipped to rspack during
      // development so CI would build the branch's assets with it;
      // shipping that flip would put swc-built code into production
      // silently, so it fails here instead of in a release.
      assert.equal(resolveBundler({env: {}}), 'webpack');
    });

    it('opts in through the --rspack flag', function () {
      assert.equal(resolveBundler({rspackFlag: true, env: {}}), 'rspack');
    });

    it('opts in through APPS_BUNDLER, the form CI and scripts use', function () {
      assert.equal(resolveBundler({env: {APPS_BUNDLER: 'rspack'}}), 'rspack');
    });

    it('falls back to the default on an unrecognized value', function () {
      assert.equal(resolveBundler({env: {APPS_BUNDLER: 'Rspack'}}), 'webpack');
    });

    it('lets the flag win over the environment', function () {
      assert.equal(
        resolveBundler({rspackFlag: true, env: {APPS_BUNDLER: 'webpack'}}),
        'rspack'
      );
    });
  });
});
