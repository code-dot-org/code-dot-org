import { expect } from '../../util/configuredChai';
import MockFirebase from '../../util/MockFirebase';
import { getDatabase } from '@cdo/apps/applab/firebaseUtils';

describe('MockFirebase', () => {
  beforeEach(() => {
    window.Applab = {
      channelId: "test-firebase-channel-id",
      firebaseName: 'test-firebase-name',
      firebaseAuthToken: 'test-firebase-auth-token',
    };
  });

  describe('once', () => {
    it('calls callbacks', done => {
      const firebase = new MockFirebase('https://example.firebaseio.com/');
      firebase.set('foo');
      firebase.once('value', snapshot => {
          expect(snapshot.val()).to.equal('foo');
          done();
        },
        error => console.warn(error));
      firebase.flush();
    });

    it('resolves promises', done => {
      const firebase = new MockFirebase('https://example.firebaseio.com/');
      firebase.set('bar');
      firebase.once('value').then(snapshot => {
          expect(snapshot.val()).to.equal('bar');
          done();
        },
        error => {throw error;});
      firebase.flush();
    });
  });

  describe('set', () => {
    it('calls callbacks', done => {
      const firebase = new MockFirebase('https://example.firebaseio.com/');
      firebase.set('foo', done);
      firebase.flush();
    });

    it('resolves promises', done => {
      const firebase = new MockFirebase('https://example.firebaseio.com/');
      firebase.set('bar').then(done);
      firebase.flush();
    });
  });

  describe('update', () => {
    it('calls callbacks', done => {
      const firebase = new MockFirebase('https://example.firebaseio.com/');
      firebase.update({foo: 'bar'}, done);
      firebase.flush();
    });

    it('resolves promises', done => {
      const firebase = new MockFirebase('https://example.firebaseio.com/');
      firebase.update({foo: 'bar'}).then(done);
      firebase.flush();
    });
  });

  it('resolves promises when invoked via firebaseUtils', done => {
    const channelRef = getDatabase(Applab.channelId);
    channelRef.set('foo');

    channelRef.once('value').then(snapshot => {
        expect(snapshot.val()).to.equal('foo');
        done();
      },
      error => {throw error;});
    channelRef.flush();
  });

  it('shares state between children', done => {
    const channelRef = getDatabase(Applab.channelId);
    channelRef.child('foo').set('bar');

    channelRef.child('foo').once('value').then(snapshot => {
        expect(snapshot.val()).to.equal('bar');
        done();
      },
      error => {throw error;});
    channelRef.flush();
  });
});
