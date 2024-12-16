from neighborhood.painter import Painter

def test_initialize_painter():
  painter = Painter()
  assert painter.getX() == 0
  assert painter.getY() == 0
  assert painter.getDirection() == "East"
  assert painter.getMyPaint() == 0

def test_set_paint():
  painter = Painter()
  assert painter.getMyPaint() == 0
  painter.setPaint(5)
  assert painter.getMyPaint() == 5
