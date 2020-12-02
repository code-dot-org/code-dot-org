import {expect} from '../../../../../../util/deprecatedChai';
import sinon from 'sinon';
import {EventEmitter} from 'events'; // provided by webpack's node-libs-browser
import Switch, {
  READ_ONLY_PROPERTIES,
  READ_WRITE_PROPERTIES
} from '@cdo/apps/lib/kits/maker/boards/circuitPlayground/Switch';

describe('Switch', () => {
  let fakeJohnnyFiveSwitch;

  before(() =>
    sinon
      .stub(Switch, '_constructFiveSwitchController')
      .callsFake((board, pin) => {
        fakeJohnnyFiveSwitch = new FakeJohnnyFiveSwitch({board, pin});
        return fakeJohnnyFiveSwitch;
      })
  );
  afterEach(() => (fakeJohnnyFiveSwitch = null));
  after(() => Switch._constructFiveSwitchController.restore());

  it('is an EventEmitter', () => {
    const testObj = new Switch({});
    expect(testObj).to.be.an.instanceOf(EventEmitter);
  });

  describe('read-only pass-through properties', () => {
    READ_ONLY_PROPERTIES.forEach(readOnlyProp => {
      it(`reads ${readOnlyProp} from the inner controller`, () => {
        const testObj = new Switch({});
        expect(testObj[readOnlyProp]).to.equal(
          fakeJohnnyFiveSwitch[readOnlyProp]
        );
      });

      it(`cannot write ${readOnlyProp}`, () => {
        const testObj = new Switch({});
        expect(() => {
          testObj[readOnlyProp] = 'new value';
        }).to.throw;
      });
    });
  });

  describe('read-write pass-through properties', () => {
    READ_WRITE_PROPERTIES.forEach(readWriteProp => {
      it(`reads ${readWriteProp} from the inner controller`, () => {
        const testObj = new Switch({});
        expect(testObj[readWriteProp]).to.equal(
          fakeJohnnyFiveSwitch[readWriteProp]
        );
      });

      it(`can write ${readWriteProp}`, () => {
        const testObj = new Switch({});
        testObj[readWriteProp] = 'new value';
        expect(testObj[readWriteProp]).to.equal('new value');
      });
    });
  });

  describe('open events', () => {
    let testObj, openSpy, closeSpy, changeSpy;

    beforeEach(() => {
      testObj = new Switch({});
      // When the johnny five switch is initialized,
      // it emits an event to represent the initial state
      fakeJohnnyFiveSwitch.emit('close');
      openSpy = sinon.spy();
      closeSpy = sinon.spy();
      changeSpy = sinon.spy();
      testObj.on('open', openSpy);
      testObj.on('close', closeSpy);
      testObj.on('change', changeSpy);
    });

    it("emits 'open' and 'change' when the first event from the inner controller is 'open'", () => {
      fakeJohnnyFiveSwitch.emit('open');
      expect(openSpy).to.have.been.calledOnce;
      expect(closeSpy).not.to.have.been.called;
      expect(changeSpy).to.have.been.calledOnce.and.calledWith(
        testObj.openValue
      );
    });

    it("does not emit extra 'open' events", () => {
      fakeJohnnyFiveSwitch.emit('open');
      fakeJohnnyFiveSwitch.emit('open');
      fakeJohnnyFiveSwitch.emit('open');
      expect(openSpy).to.have.been.calledOnce;
      expect(closeSpy).not.to.have.been.called;
      expect(changeSpy).to.have.been.calledOnce.and.calledWith(
        testObj.openValue
      );
    });

    it("emits events when changing from 'open' to 'close' or back", () => {
      fakeJohnnyFiveSwitch.emit('open');
      fakeJohnnyFiveSwitch.emit('close');
      fakeJohnnyFiveSwitch.emit('open');
      fakeJohnnyFiveSwitch.emit('close');
      expect(openSpy).to.have.been.calledTwice;
      expect(closeSpy).to.have.been.calledTwice;
      expect(changeSpy).to.have.callCount(4);
    });
  });

  describe('close events', () => {
    let testObj, openSpy, closeSpy, changeSpy;

    beforeEach(() => {
      testObj = new Switch({});
      fakeJohnnyFiveSwitch.emit('open');
      openSpy = sinon.spy();
      closeSpy = sinon.spy();
      changeSpy = sinon.spy();
      testObj.on('open', openSpy);
      testObj.on('close', closeSpy);
      testObj.on('change', changeSpy);
    });

    it("emits 'close' and 'change' when the first event from the inner controller is 'close'", () => {
      fakeJohnnyFiveSwitch.emit('close');
      expect(openSpy).not.to.have.been.called;
      expect(closeSpy).to.have.been.calledOnce;
      expect(changeSpy).to.have.been.calledOnce.and.calledWith(
        testObj.closeValue
      );
    });

    it("does not emit extra 'close' events", () => {
      fakeJohnnyFiveSwitch.emit('close');
      fakeJohnnyFiveSwitch.emit('close');
      fakeJohnnyFiveSwitch.emit('close');
      expect(openSpy).not.to.have.been.called;
      expect(closeSpy).to.have.been.calledOnce;
      expect(changeSpy).to.have.been.calledOnce.and.calledWith(
        testObj.closeValue
      );
    });
  });
});

class FakeJohnnyFiveSwitch extends EventEmitter {
  constructor({board, pin}) {
    super();
    this.board = board;
    this.pin = pin;
  }
  isOpen = false;
  isClosed = false;
  value = 0;
  closeValue = 0;
  openValue = 1;
  invert = false;
}
