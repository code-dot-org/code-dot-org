# sample main for testing
from neighborhood import Painter

print("Hello world")
p1 = Painter(0,1)
p1.turn_left()
p1.turn_left()
p2 = Painter(0,0,'south',2)
p2.move()
p2.paint('Red')
p2.turn_left()
p2.move()
p2.paint('Blue')
