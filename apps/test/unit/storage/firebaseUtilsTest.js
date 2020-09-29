import {expect} from '../../util/deprecatedChai';
import {
  fixFirebaseKey,
  validateFirebaseKey
} from '@cdo/apps/storage/firebaseUtils';

describe('firebaseUtils', () => {
  describe('validateFirebaseKey', () => {
    it('allows alphanumeric strings with spaces', () => {
      validateFirebaseKey('foo BAR 123');
    });

    it('allows keys of length 768', () => {
      validateFirebaseKey('a'.repeat(768));
    });

    it('rejects keys of length 769', done => {
      try {
        validateFirebaseKey('b'.repeat(769));
      } catch (e) {
        expect(e.message.toLowerCase()).to.contain('too long');
        done();
      }
    });

    it('rejects empty strings', done => {
      try {
        validateFirebaseKey('');
      } catch (e) {
        expect(e.message.toLowerCase()).to.contain('empty');
        done();
      }
    });

    it('rejects forbidden symbols', done => {
      try {
        validateFirebaseKey('a$b');
      } catch (e) {
        expect(e.message.toLowerCase()).to.contain('illegal character "$"');
        done();
      }
    });

    it('rejects ascii control codes', done => {
      try {
        validateFirebaseKey('\n');
      } catch (e) {
        expect(e.message.toLowerCase()).to.contain('illegal character code');
        done();
      }
    });

    it('allows unicode', () => {
      validateFirebaseKey('☃');
    });

    it('allows periods', () => {
      validateFirebaseKey('a.b.c.d');
    });
  });

  describe('fixFirebaseKey', () => {
    it('preserves legal characters', () => {
      expect(fixFirebaseKey('foo.bar')).to.equal('foo.bar');
    });

    it('preserves url escape sequences', () => {
      expect(fixFirebaseKey('foo%20bar')).to.equal('foo%20bar');
    });

    it('replaces illegal characters', () => {
      expect(fixFirebaseKey('foo$bar')).to.equal('foo-bar');
    });

    it('replaces multiple illegal characters', () => {
      expect(fixFirebaseKey('a.b#c$d[e]f/g')).to.equal('a.b-c-d-e-f-g');
    });
  });
});
