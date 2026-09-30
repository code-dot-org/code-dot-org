// From @code-dot-org/dance-party 2.0.4, src/shapes/smiley.js.
export function drawSmiley(ctx: CanvasRenderingContext2D, alpha: number): void {
  ctx.save();
  ctx.strokeStyle = 'rgba(0,0,0,0)';
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';
  ctx.miterLimit = 4;
  ctx.save();
  ctx.fillStyle = '#ffdf40';
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(8.5, 8, 8, 0, 6.283185307179586, true);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = '#311a12';
  ctx.globalAlpha = 0.9;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(6.9, 6.4);
  ctx.bezierCurveTo(6.9, 7.283, 6.422000000000001, 8, 5.833, 8);
  ctx.bezierCurveTo(5.244, 8, 4.767, 7.283, 4.767, 6.4);
  ctx.bezierCurveTo(
    4.767,
    5.516,
    5.244000000000001,
    4.800000000000001,
    5.833,
    4.800000000000001,
  );
  ctx.bezierCurveTo(6.423, 4.800000000000001, 6.9, 5.516000000000001, 6.9, 6.4);
  ctx.closePath();
  ctx.moveTo(4.894, 10.666);
  ctx.bezierCurveTo(
    5.322,
    11.803,
    6.774,
    12.639000000000001,
    8.5,
    12.639000000000001,
  );
  ctx.bezierCurveTo(10.225, 12.639000000000001, 11.678, 11.803, 12.106, 10.666);
  ctx.bezierCurveTo(11.227, 11.222000000000001, 9.936, 11.573, 8.5, 11.573);
  ctx.bezierCurveTo(7.063, 11.573, 5.773, 11.222000000000001, 4.894, 10.666);
  ctx.closePath();
  ctx.moveTo(11.167, 8);
  ctx.bezierCurveTo(11.756, 8, 12.233, 7.283, 12.233, 6.4);
  ctx.bezierCurveTo(
    12.233,
    5.516,
    11.756,
    4.800000000000001,
    11.167,
    4.800000000000001,
  );
  ctx.bezierCurveTo(
    10.577,
    4.800000000000001,
    10.1,
    5.516000000000001,
    10.1,
    6.4,
  );
  ctx.bezierCurveTo(10.1, 7.283, 10.578, 8, 11.167, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.restore();
  ctx.restore();
}
