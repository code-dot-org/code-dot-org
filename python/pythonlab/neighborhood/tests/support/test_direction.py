from neighborhood.support.direction import Direction

def test_create_valid_direction():
  north = Direction('North')
  assert north.value == 'north'
  assert north.is_north()
  assert not north.is_east()

  east = Direction('east')
  assert east.value == 'east'
  assert east.is_east()

def test_cannot_create_invalid_direction():
  try:
    Direction('invalid')
    assert False
  except Exception as e:
    assert str(e) == "NeighborhoodRuntimeException: INVALID_DIRECTION"

def test_turn_left():
  direction = Direction('north')
  direction.turn_left()
  assert direction.is_west()
  direction.turn_left()
  assert direction.is_south()
  direction.turn_left()
  assert direction.is_east()
  direction.turn_left()
  assert direction.is_north()