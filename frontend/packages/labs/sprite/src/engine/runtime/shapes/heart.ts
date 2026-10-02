// From @code-dot-org/dance-party 2.0.4, src/shapes/heart.js.
export function drawHeart(
  ctx: CanvasRenderingContext2D,
  color: string | {toString(): string},
): void {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0)';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(18, 0);
  ctx.lineTo(18, 16);
  ctx.lineTo(0, 16);
  ctx.closePath();
  ctx.clip();
  ctx.strokeStyle = 'rgba(0,0,0,0)';
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';
  ctx.miterLimit = 4;
  ctx.save();
  ctx.fillStyle = color.toString();
  ctx.beginPath();
  ctx.moveTo(0, 5.016);
  ctx.bezierCurveTo(0, 6.718, 0.84, 7.959, 2.014, 9.128);
  ctx.lineTo(8.85, 15.937999999999999);
  ctx.translate(9, 15.785369727773288);
  ctx.rotate(0);
  ctx.scale(1, 1);
  ctx.arc(0, 0, 0.214, 2.3475033371885377, 0.7940893164012557, true);
  ctx.scale(1, 1);
  ctx.rotate(0);
  ctx.translate(-9, -15.785369727773288);
  ctx.lineTo(15.986, 9.128);
  ctx.bezierCurveTo(17.16, 7.958, 18, 6.718, 18, 5.016);
  ctx.bezierCurveTo(18, 2.246, 15.684, 0, 12.828, 0);
  ctx.translate(12.806054971254465, 5.231953976834406);
  ctx.rotate(0);
  ctx.scale(1, 1);
  ctx.arc(0, 0, 5.232, -1.5666019282681247, -2.385404775142245, true);
  ctx.scale(1, 1);
  ctx.rotate(0);
  ctx.translate(-12.806054971254465, -5.231953976834406);
  ctx.translate(5.193945028745534, 5.231953976834407);
  ctx.rotate(0);
  ctx.scale(1, 1);
  ctx.arc(0, 0, 5.232, -0.7561878784475481, -1.5749907253216684, true);
  ctx.scale(1, 1);
  ctx.rotate(0);
  ctx.translate(-5.193945028745534, -5.231953976834407);
  ctx.bezierCurveTo(2.316, 0, 0, 2.246, 0, 5.016);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.moveTo(9.001, 2.673);
  ctx.translate(5.7940041418097, 6.064961315456039);
  ctx.rotate(0);
  ctx.scale(1, 1);
  ctx.arc(0, 0, 4.668, -0.8134203244268714, -1.5748674909565874, true);
  ctx.scale(1, 1);
  ctx.rotate(0);
  ctx.translate(-5.7940041418097, -6.064961315456039);
  ctx.bezierCurveTo(
    3.2379999999999995,
    1.397,
    1.1819999999999995,
    3.38,
    1.1819999999999995,
    5.8260000000000005,
  );
  ctx.bezierCurveTo(
    1.1819999999999995,
    6.6530000000000005,
    1.4169999999999994,
    7.4270000000000005,
    1.8259999999999996,
    8.089,
  );
  ctx.translate(4.795990939436072, 4.927133807437823);
  ctx.rotate(0);
  ctx.scale(1, 1);
  ctx.arc(0, 0, 4.338, 2.324913157276619, 3.1395488087915053, false);
  ctx.scale(1, 1);
  ctx.rotate(0);
  ctx.translate(-4.795990939436072, -4.927133807437823);
  ctx.bezierCurveTo(0.458, 2.49, 2.515, 0.508, 5.052, 0.508);
  ctx.bezierCurveTo(6.73, 0.508, 8.2, 1.376, 9, 2.673);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}
