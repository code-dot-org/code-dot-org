/** @file Test of the p5.play CircleCollider class */
/* global p5 */
import {expect} from '../../util/configuredChai';
import createGameLabP5 from '../../util/gamelab/TestableGameLabP5';

describe('CircleCollider', function () {
  var pInst;

  beforeEach(function () {
    pInst = createGameLabP5().p5;
  });

  afterEach(function () {
    pInst.remove();
  });

  // Create with zero offset and radius=1 to simplify tests
  function makeAt(x, y) {
    return new pInst.CircleCollider(
      new p5.Vector(x, y),
      1,
      new p5.Vector(0, 0)
    );
  }

  // Create at a (0,0) with radius=1 to test use of offsets
  function makeWithOffset(x, y) {
    return new pInst.CircleCollider(
      new p5.Vector(0, 0),
      1,
      new p5.Vector(x, y)
    );
  }

  it('conforms to the collider interface', function () {
    // Still figuring out what this is though;
    var collider = new pInst.CircleCollider();
    expect(collider).to.haveOwnProperty('draw');
    expect(collider).to.haveOwnProperty('overlap');
    expect(collider).to.haveOwnProperty('collide');
    expect(collider).to.haveOwnProperty('size');
    expect(collider).to.haveOwnProperty('left');
    expect(collider).to.haveOwnProperty('right');
    expect(collider).to.haveOwnProperty('top');
    expect(collider).to.haveOwnProperty('bottom');
  });

  describe('overlap()', function () {
    describe('circle-circle', function () {
      // Returns a boolean.
      it('true when exactly overlapped', function () {
        var a = makeAt(2, 2);
        var b = makeAt(2, 2);
        expect(a.overlap(b)).to.be.true;
        expect(b.overlap(a)).to.be.true;
      });

      it('true when partially overlapped', function () {
        var a = makeAt(2, 2);
        var b = makeAt(2, 3);
        expect(a.overlap(b)).to.be.true;
        expect(b.overlap(a)).to.be.true;
      });

      it('false when tangent along axes', function () {
        var a = makeAt(2, 2);
        var b = makeAt(4, 2); // Separated by 2 on the x-axis
        expect(a.overlap(b)).to.be.false;
        expect(b.overlap(a)).to.be.false;

        var c = makeAt(2, 4); // Separated by 2 on the y-axis
        expect(a.overlap(c)).to.be.false;
        expect(c.overlap(a)).to.be.false;
      });

      it('true when tangent along 45deg line', function () {
        var a = makeAt(2, 2);
        var b = makeAt(2 + 2 * Math.cos(Math.PI / 4),
          2 + 2 * Math.sin(Math.PI / 4));
        expect(a.overlap(b)).to.be.true;
        expect(b.overlap(a)).to.be.true;
      });

      it('false when distant along axes', function () {
        var a = makeAt(2, 2);
        var b = makeAt(5, 2); // Separated by 3 on the x-axis
        expect(a.overlap(b)).to.be.false;
        expect(b.overlap(a)).to.be.false;

        var c = makeAt(2, 5); // Separated by 3 on the y-axis
        expect(a.overlap(c)).to.be.false;
        expect(c.overlap(a)).to.be.false;
      });

      it('false when distant along 45deg line', function () {
        var a = makeAt(2, 2);
        var b = makeAt(4, 4); // Separated by 2 on both x and y axes
        expect(a.overlap(b)).to.be.false;
        expect(b.overlap(a)).to.be.false;
      });

      it('true when exactly overlapped by offset', function () {
        var a = makeAt(2, 2);
        var b = makeWithOffset(2, 2);
        expect(a.overlap(b)).to.be.true;
        expect(b.overlap(a)).to.be.true;
      });

      it('true when partially overlapped by offset', function () {
        var a = makeAt(2, 2);
        var b = makeWithOffset(2, 3);
        expect(a.overlap(b)).to.be.true;
        expect(b.overlap(a)).to.be.true;
      });

      it('false when tangent along axes by offset', function () {
        var a = makeAt(2, 2);
        var b = makeWithOffset(4, 2); // Separated by 2 on the x-axis
        expect(a.overlap(b)).to.be.false;
        expect(b.overlap(a)).to.be.false;

        var c = makeWithOffset(2, 4); // Separated by 2 on the y-axis
        expect(a.overlap(c)).to.be.false;
        expect(c.overlap(a)).to.be.false;
      });

      it('true when tangent along 45deg line by offset', function () {
        var a = makeAt(2, 2);
        var b = makeWithOffset(2 + 2 * Math.cos(Math.PI / 4),
          2 + 2 * Math.sin(Math.PI / 4));
        expect(a.overlap(b)).to.be.true;
        expect(b.overlap(a)).to.be.true;
      });

      it('false when distant along axes by offset', function () {
        var a = makeAt(2, 2);
        var b = makeWithOffset(5, 2); // Separated by 3 on the x-axis
        expect(a.overlap(b)).to.be.false;
        expect(b.overlap(a)).to.be.false;

        var c = makeWithOffset(2, 5); // Separated by 3 on the y-axis
        expect(a.overlap(c)).to.be.false;
        expect(c.overlap(a)).to.be.false;
      });

      it('false when distant along 45deg line by offset', function () {
        var a = makeAt(2, 2);
        var b = makeWithOffset(4, 4); // Separated by 2 on both x and y axes
        expect(a.overlap(b)).to.be.false;
        expect(b.overlap(a)).to.be.false;
      });
    });
  });

  describe('collide()', function () {
    // Returns an displacement vector
    describe('circle-circle', function () {
      it('projects horizontally when exactly overlapped', function () {
        var a = makeAt(2, 2);
        var b = makeAt(2, 2);
        var displacement1 = a.collide(b);
        var displacement2 = b.collide(a);
        expect(displacement1.x).to.equal(2);
        expect(displacement1.y).to.equal(0);
        expect(displacement2.x).to.equal(2);
        expect(displacement2.y).to.equal(0);
      });

      it('projects out when partially overlapped along axes', function () {
        var a = makeAt(2, 2);

        var b = makeAt(2, 3);
        var verticalDisplacement1 = a.collide(b);
        var verticalDisplacement2 = b.collide(a);
        expect(verticalDisplacement1.x).to.closeTo(0, 0.001);
        expect(verticalDisplacement1.y).to.equal(-1);
        expect(verticalDisplacement2.x).to.closeTo(0, 0.001);
        expect(verticalDisplacement2.y).to.equal(1);

        var c = makeAt(3, 2);
        var horizontalDisplacement1 = a.collide(c);
        var horizontalDisplacement2 = c.collide(a);
        expect(horizontalDisplacement1.x).to.equal(-1);
        expect(horizontalDisplacement1.y).to.closeTo(0, 0.001);
        expect(horizontalDisplacement2.x).to.equal(1);
        expect(horizontalDisplacement2.y).to.closeTo(0, 0.001);
      });

      it('projects at an angle when overlapped at an angle', function () {
        var a = makeAt(2, 2);

        // At 45deg
        var b = makeAt(3, 3);
        var displacementB1 = a.collide(b);
        var displacementB2 = b.collide(a);
        expect(displacementB1.x).to.be.closeTo(-0.414, 0.001);
        expect(displacementB1.y).to.be.closeTo(-0.414, 0.001);
        expect(displacementB2.x).to.be.closeTo(0.414, 0.001);
        expect(displacementB2.y).to.be.closeTo(0.414, 0.001);

        var c = makeAt(1.5, 3);
        var displacementC1 = a.collide(c);
        var displacementC2 = c.collide(a);
        expect(displacementC1.x).to.be.closeTo(0.394, 0.001);
        expect(displacementC1.y).to.be.closeTo(-0.788, 0.001);
        expect(displacementC2.x).to.be.closeTo(-0.394, 0.001);
        expect(displacementC2.y).to.be.closeTo(0.788, 0.001);
      });

      it('returns zero vector when not overlapping', function () {
        var a = makeAt(2, 2);

        var b = makeAt(5, 2); // Separated by 3 on the x-axis
        var displacementB1 = a.collide(b);
        var displacementB2 = b.collide(a);
        expect(displacementB1.x).to.equal(0);
        expect(displacementB1.y).to.equal(0);
        expect(displacementB2.x).to.equal(0);
        expect(displacementB2.y).to.equal(0);

        var c = makeAt(2, 5); // Separated by 3 on the y-axis
        var displacementC1 = a.collide(c);
        var displacementC2 = c.collide(a);
        expect(displacementC1.x).to.equal(0);
        expect(displacementC1.y).to.equal(0);
        expect(displacementC2.x).to.equal(0);
        expect(displacementC2.y).to.equal(0);

        var d = makeAt(4, 4); // Separated by 2 on both x and y axes
        var displacementD1 = a.collide(d);
        var displacementD2 = d.collide(a);
        expect(displacementD1.x).to.equal(0);
        expect(displacementD1.y).to.equal(0);
        expect(displacementD2.x).to.equal(0);
        expect(displacementD2.y).to.equal(0);
      });

      it('projects horizontally when exactly overlapped by offset', function () {
        var a = makeAt(2, 2);
        var b = makeWithOffset(2, 2);
        var displacement1 = a.collide(b);
        var displacement2 = b.collide(a);
        expect(displacement1.x).to.equal(2);
        expect(displacement1.y).to.equal(0);
        expect(displacement2.x).to.equal(2);
        expect(displacement2.y).to.equal(0);
      });

      it('projects out when partially overlapped along axes by offset', function () {
        var a = makeAt(2, 2);

        var b = makeWithOffset(2, 3);
        var verticalDisplacement1 = a.collide(b);
        var verticalDisplacement2 = b.collide(a);
        expect(verticalDisplacement1.x).to.closeTo(0, 0.001);
        expect(verticalDisplacement1.y).to.equal(-1);
        expect(verticalDisplacement2.x).to.closeTo(0, 0.001);
        expect(verticalDisplacement2.y).to.equal(1);

        var c = makeWithOffset(3, 2);
        var horizontalDisplacement1 = a.collide(c);
        var horizontalDisplacement2 = c.collide(a);
        expect(horizontalDisplacement1.x).to.equal(-1);
        expect(horizontalDisplacement1.y).to.closeTo(0, 0.001);
        expect(horizontalDisplacement2.x).to.equal(1);
        expect(horizontalDisplacement2.y).to.closeTo(0, 0.001);
      });

      it('projects at an angle when overlapped at an angle by offset', function () {
        var a = makeAt(2, 2);

        // At 45deg
        var b = makeWithOffset(3, 3);
        var displacementB1 = a.collide(b);
        var displacementB2 = b.collide(a);
        expect(displacementB1.x).to.be.closeTo(-0.414, 0.001);
        expect(displacementB1.y).to.be.closeTo(-0.414, 0.001);
        expect(displacementB2.x).to.be.closeTo(0.414, 0.001);
        expect(displacementB2.y).to.be.closeTo(0.414, 0.001);

        var c = makeWithOffset(1.5, 3);
        var displacementC1 = a.collide(c);
        var displacementC2 = c.collide(a);
        expect(displacementC1.x).to.be.closeTo(0.394, 0.001);
        expect(displacementC1.y).to.be.closeTo(-0.788, 0.001);
        expect(displacementC2.x).to.be.closeTo(-0.394, 0.001);
        expect(displacementC2.y).to.be.closeTo(0.788, 0.001);
      });

      it('returns zero vector when not overlapping by offset', function () {
        var a = makeAt(2, 2);

        var b = makeWithOffset(5, 2); // Separated by 3 on the x-axis
        var displacementB1 = a.collide(b);
        var displacementB2 = b.collide(a);
        expect(displacementB1.x).to.equal(0);
        expect(displacementB1.y).to.equal(0);
        expect(displacementB2.x).to.equal(0);
        expect(displacementB2.y).to.equal(0);

        var c = makeWithOffset(2, 5); // Separated by 3 on the y-axis
        var displacementC1 = a.collide(c);
        var displacementC2 = c.collide(a);
        expect(displacementC1.x).to.equal(0);
        expect(displacementC1.y).to.equal(0);
        expect(displacementC2.x).to.equal(0);
        expect(displacementC2.y).to.equal(0);

        var d = makeWithOffset(4, 4); // Separated by 2 on both x and y axes
        var displacementD1 = a.collide(d);
        var displacementD2 = d.collide(a);
        expect(displacementD1.x).to.equal(0);
        expect(displacementD1.y).to.equal(0);
        expect(displacementD2.x).to.equal(0);
        expect(displacementD2.y).to.equal(0);
      });
    });
  });

  describe('size()', function () {
    var collider, radius;

    beforeEach(function () {
      radius = Math.floor(100 * Math.random());
      collider = new pInst.CircleCollider(
        new p5.Vector(0, 0),
        radius,
        new p5.Vector(0, 0)
      );
    });

    it('returns a p5.Vector', function () {
      expect(collider.size()).to.be.an.instanceOf(p5.Vector);
    });

    it('is twice the circle radius in each direction', function () {
      var size = collider.size();
      expect(size.x).to.equal(2 * radius);
      expect(size.y).to.equal(2 * radius);
    });
  });
});
