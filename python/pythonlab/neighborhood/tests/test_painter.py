from neighborhood.painter import Painter

def test_initialize_painter():
  painter = Painter()
  assert painter.x == 0
  assert painter.y == 0
  assert painter.direction == "East"
  assert painter.paint == 0