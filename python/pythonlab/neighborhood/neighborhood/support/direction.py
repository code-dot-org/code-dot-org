from .exception_key import ExceptionKey
from .neighborhood_runtime_exception import NeighborhoodRuntimeException

NORTH = 'north'
EAST = 'east'
SOUTH = 'south'
WEST = 'west'
VALID_DIRECTIONS = [NORTH, EAST, SOUTH, WEST]

class Direction:
  def __init__(self, direction: str):
    direction_lower = direction.lower()
    if direction_lower not in VALID_DIRECTIONS:
      raise NeighborhoodRuntimeException(ExceptionKey.INVALID_DIRECTION)
    self.value = direction_lower

  def is_north(self) -> bool:
    return self.value == NORTH
  
  def is_south(self) -> bool:
    return self.value == SOUTH
  
  def is_east(self) -> bool:
    return self.value == EAST
  
  def is_west(self) -> bool:
    return self.value == WEST
  
  def turn_left(self):
    self.value = VALID_DIRECTIONS[(VALID_DIRECTIONS.index(self.value) - 1) % 4]
