import { expect } from '../../util/configuredChai';
import MockFirebase from '../../util/MockFirebase';
import { getDatabase } from '@cdo/apps/applab/firebaseUtils';

describe('MockFirebase', () => {
  describe('initialization', () => {
    let firebase;

    beforeEach(() => {
      firebase = new MockFirebase('https://example.firebaseio.com/');
      firebase.autoFlush();
      return firebase.set('foo');
    });

    it('tests can see data set in beforeEach', done => {
      firebase.once('value').then(snapshot => {
        expect(snapshot.val()).to.equal('foo');
        done();
      });
    });
  });

  describe('when invoked directly', () => {
    let firebase;

    beforeEach(() => {
      firebase = new MockFirebase('https://example.firebaseio.com/');
      firebase.autoFlush();
    });

    describe('once', () => {
      it('calls callbacks', done => {
        firebase.set('foo');
        firebase.once('value',
          snapshot => {
            expect(snapshot.val()).to.equal('foo');
            done();
          },
          error => {throw error;});
      });

      it('resolves promises', done => {
        firebase.set('bar');
        firebase.once('value').then(
          snapshot => {
            expect(snapshot.val()).to.equal('bar');
            done();
          },
          error => {throw error;});
      });
    });

    describe('set', () => {
      it('calls callbacks', done => {
        firebase.set('foo', done);
      });

      it('resolves promises', done => {
        firebase.set('bar').then(done);
      });
    });

    describe('update', () => {
      it('calls callbacks', done => {
        firebase.update({foo: 'bar'}, done);
      });

      it('resolves promises', done => {
        firebase.update({foo: 'bar'}).then(done);
      });

      it('preserves existing data', done => {
        firebase.set({foo: 1})
          .then(() => firebase.update({bar: 2}))
          .then(() => firebase.once('value'))
          .then(snapshot => {
            expect(snapshot.val()).to.deep.equal({foo:1, bar:2});
            done();
          });
      });

      it('incorrectly redundantly adds deeply nested keys', done => {
        firebase.update({'foo/bar': 1})
          .then(() => firebase.once('value'))
          .then(snapshot => {
            expect(snapshot.val()).to.deep.equal({
              foo: {bar: 1},
              // This key's presence is incorrect, and makes it hard to test
              // features which do sparse updates to deeply nested keys.
              'foo/bar': 1,
            });
            done();
          });
      });
    });

    describe('transaction', () => {
      it('calls callbacks', done => {
        firebase.set('foo', () => {
          firebase.transaction(data => {
            return 'bar';
          }, (error, committed, snapshot) => {
            expect(committed).to.equal(true);
            expect(snapshot.val()).to.equal('bar');
            done();
          });
        });
      });

      it('resolves promises', done => {
        firebase.set('foo').then(() => {
          firebase.transaction(data => {
            return 'bar';
          }).then(txnData => {
            expect(txnData.committed).to.equal(true);
            expect(txnData.snapshot.val()).to.equal('bar');
            done();
          });
        });
      });
    });
  });

  describe('when invoked via firebaseUtils', () => {
    let channelRef;

    beforeEach(() => {
      window.Applab = {
        channelId: "test-firebase-channel-id",
        firebaseName: 'test-firebase-name',
        firebaseAuthToken: 'test-firebase-auth-token',
      };
      channelRef = getDatabase(Applab.channelId);
      channelRef.autoFlush();
    });

    it('resolves promises', done => {
      channelRef.set('foo');
      channelRef.once('value').then(
        snapshot => {
          expect(snapshot.val()).to.equal('foo');
          done();
        },
        error => {throw error;});
    });

    it('shares state between children', done => {
      channelRef.child('foo').set('bar');
      channelRef.child('foo').once('value').then(
        snapshot => {
          expect(snapshot.val()).to.equal('bar');
          done();
        },
        error => {throw error;});
    });
  });
});
