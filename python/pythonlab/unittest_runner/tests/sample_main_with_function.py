# sample main for testing that uses a function and a global variable.
from neighborhood import Painter

print("Hello world")
p1 = Painter(0,1)

def move_painter():
  p1.turn_left()
  p1.turn_left()
  p2 = Painter(0,0,'south',2)
  p2.move()
  p2.paint('Red')
  p2.turn_left()
  p2.move()
  p2.paint('Blue')

move_painter()
