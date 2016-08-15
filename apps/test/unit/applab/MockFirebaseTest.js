import { expect } from '../../util/configuredChai';
import MockFirebase from '../../util/MockFirebase';
import { getDatabase } from '@cdo/apps/applab/firebaseUtils';

describe('MockFirebase', () => {
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
          error => console.warn(error));
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
    });
  });

  describe('when invoked via firebaseUtils', () => {
    let channelRef;

    beforeEach(() => {
      window.Applab = Object.assign({}, window.Applab, {
        channelId: "test-firebase-channel-id",
        firebaseName: 'test-firebase-name',
        firebaseAuthToken: 'test-firebase-auth-token',
      });
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
