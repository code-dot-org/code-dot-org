import subprocess
import sys

import neighborhood
from neighborhood import painter
from neighborhood.painter import Painter
from neighborhood.support.world import World
from neighborhood.support.neighborhood_context_type import NeighborhoodContextType
from neighborhood.support.neighborhood_tracker import NeighborhoodTracker
from support.constants import SAMPLE_MAZE, ALL_PASSABLE_MAZE, BUCKET_MAZE, LARGE_MAZE

def set_up_world(maze, context_type=NeighborhoodContextType.RUN):
  world = World()
  # Set up the world from a string rather than trying to load a file.
  world.set_grid_from_string(maze)
  world.set_context_type(context_type)
  return world

def test_import_does_not_create_a_painter():
  # A painter built at import time would take the first slot in every program's
  # NeighborhoodLog, and validation code indexes into that list by position.
  # This runs in a subprocess because this file imports the package before
  # pytest starts capturing output, so nothing measured in-process can rule out
  # a painter having been built at import.
  program = '\n'.join([
    'from neighborhood import painter',
    'from neighborhood.support.world import World',
    'from neighborhood.support.neighborhood_context_type import NeighborhoodContextType',
    'world = World()',
    'world.set_grid_from_string(%r)' % ALL_PASSABLE_MAZE,
    'world.set_context_type(NeighborhoodContextType.RUN)',
    'assert painter._default_painter is None',
    'print("no painter")',
  ])
  result = subprocess.run(
    [sys.executable, '-c', program], capture_output=True, text=True)
  assert result.returncode == 0, result.stderr
  # Any painter would have announced itself here with an INITIALIZE_PAINTER.
  assert result.stdout == 'no painter\n'

def test_painter_is_created_on_first_call(capsys):
  set_up_world(ALL_PASSABLE_MAZE)
  # Setting up a world does not bring a painter with it. Nothing exists, and so
  # nothing announces itself, until one of the functions is called.
  assert capsys.readouterr().out == ''
  painter.move()
  printed = capsys.readouterr().out
  assert 'INITIALIZE_PAINTER' in printed
  assert 'MOVE' in printed

def test_repeated_calls_reuse_one_painter():
  set_up_world(ALL_PASSABLE_MAZE)
  painter.move()
  first = painter._get_default_painter()
  painter.turn_left()
  assert painter._get_default_painter() is first
  assert painter._get_default_painter().id == first.id

def test_movement_and_direction_functions():
  set_up_world(ALL_PASSABLE_MAZE)
  assert painter.get_x() == 0
  assert painter.get_y() == 0
  assert painter.get_direction() == 'east'
  assert painter.is_facing_east() is True
  painter.move()
  assert painter.get_x() == 1
  assert painter.get_y() == 0
  painter.turn_left()
  assert painter.get_direction() == 'north'
  assert painter.is_facing_north() is True
  assert painter.is_facing_east() is False
  assert painter.is_facing_south() is False
  assert painter.is_facing_west() is False

def test_paint_functions():
  set_up_world(ALL_PASSABLE_MAZE)
  painter.set_paint(3)
  assert painter.is_on_paint() is False
  assert painter.get_color() is None
  painter.paint('red')
  assert painter.is_on_paint() is True
  assert painter.get_color() == 'red'
  assert painter.get_my_paint() == 2
  painter.scrape_paint()
  assert painter.is_on_paint() is False
  assert painter.get_color() is None

def test_bucket_functions():
  # Square 0,0 is a bucket with paint_count = 3.
  set_up_world(BUCKET_MAZE)
  assert painter.is_on_bucket() is True
  painter.take_paint()
  painter.take_paint()
  assert painter.is_on_bucket() is True
  painter.take_paint()
  assert painter.is_on_bucket() is False

def test_can_move():
  # The painter starts at 0,0 in a 2x2 grid whose only wall is at 0,1.
  set_up_world(SAMPLE_MAZE)
  assert painter.can_move('north') is False
  assert painter.can_move('south') is False
  assert painter.can_move('east') is True
  assert painter.can_move('west') is False
  # Without a parameter, can_move checks the direction the painter is facing.
  assert painter.can_move() is True
  painter.move()
  assert painter.can_move('east') is False
  assert painter.can_move('south') is True

def test_paint_supply_matches_a_plain_painter():
  # The default painter is built like Painter() with no arguments, so it starts
  # with nothing on a grid this small and has to be given paint.
  set_up_world(SAMPLE_MAZE)
  assert Painter().has_infinite_paint is False
  assert painter.has_paint() is False
  painter.set_paint(2)
  assert painter.has_paint() is True
  assert painter.get_my_paint() == 2

  # On a grid this large it gets infinite paint, again like Painter().
  set_up_world(LARGE_MAZE)
  assert painter.has_paint() is True
  painter.paint('red')
  painter.paint('blue')
  assert painter.has_paint() is True

def test_swapping_the_grid_starts_a_new_painter():
  set_up_world(ALL_PASSABLE_MAZE)
  painter.move()
  assert painter.get_x() == 1
  first = painter._get_default_painter()

  set_up_world(ALL_PASSABLE_MAZE)
  assert painter._get_default_painter() is not first
  assert painter.get_x() == 0

def test_removing_the_grid_starts_a_new_painter():
  world = set_up_world(ALL_PASSABLE_MAZE)
  painter.move()
  assert painter.get_x() == 1
  # Teardown clears the grid between runs, so the next run must not resume the
  # previous run's painter.
  world.remove_grid()
  world.set_grid_from_string(ALL_PASSABLE_MAZE)
  assert painter.get_x() == 0

def test_changing_the_context_type_starts_a_new_painter():
  world = set_up_world(ALL_PASSABLE_MAZE)
  painter.move()
  first = painter._get_default_painter()

  world.set_context_type(NeighborhoodContextType.VALIDATE)
  second = painter._get_default_painter()
  assert second is not first
  assert second.get_x() == 0

  NeighborhoodTracker(world).reset()
  world.set_context_type(NeighborhoodContextType.RUN)

def test_validation_sees_the_painter_on_every_pass():
  # ValidationProtocol brackets each exec of main.py with VALIDATE ... RUN and
  # can exec it more than once. A painter carried over from an earlier pass
  # would emit no INITIALIZE_PAINTER, so the tracker would discard all of its
  # signals and the log would come back empty.
  world = set_up_world(ALL_PASSABLE_MAZE, NeighborhoodContextType.VALIDATE)
  tracker = NeighborhoodTracker(world)
  tracker.reset()

  def student_program():
    painter.set_paint(1)
    # Square 1,0 holds a bucket, which cannot be painted, so paint first.
    painter.paint('red')
    painter.move()

  student_program()
  first_log = tracker.get_neighborhood_log()
  assert len(first_log.painter_logs) == 1
  assert first_log.painter_logs[0].ending_position.x == 1
  assert first_log.painter_logs[0].action_count('PAINT') == 1

  tracker.reset()
  world.set_context_type(NeighborhoodContextType.RUN)
  world.set_context_type(NeighborhoodContextType.VALIDATE)

  # A painter carried over from the first pass would arrive with its paint
  # already spent and its position already advanced.
  student_program()
  second_log = tracker.get_neighborhood_log()
  assert len(second_log.painter_logs) == 1
  assert second_log.painter_logs[0].starting_position.x == 0
  assert second_log.painter_logs[0].ending_position.x == 1
  assert second_log.painter_logs[0].action_count('PAINT') == 1

  tracker.reset()
  world.set_context_type(NeighborhoodContextType.RUN)

def test_explicit_painters_keep_their_place_in_the_log():
  # Validation code indexes painter_logs by position, so a painter the student
  # constructed must stay where it was.
  world = set_up_world(ALL_PASSABLE_MAZE, NeighborhoodContextType.VALIDATE)
  tracker = NeighborhoodTracker(world)
  tracker.reset()

  explicit_painter = Painter()
  painter.move()

  log = tracker.get_neighborhood_log()
  assert len(log.painter_logs) == 2
  assert log.painter_logs[0].painter_id == explicit_painter.id
  assert log.painter_logs[1].painter_id == painter._get_default_painter().id

  tracker.reset()
  world.set_context_type(NeighborhoodContextType.RUN)

def test_painter_name_refers_to_the_submodule():
  # `from neighborhood import painter` must keep resolving to the module, so
  # painter.move() and neighborhood.painter.move() are the same function.
  assert painter is sys.modules['neighborhood.painter']
  assert neighborhood.painter is sys.modules['neighborhood.painter']

def test_star_import_names_all_exist():
  for name in neighborhood.__all__:
    assert hasattr(neighborhood, name)
