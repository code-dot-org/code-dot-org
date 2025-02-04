from neighborhood.support.painter_tracker import PainterTracker
from neighborhood.support.position import Position
from neighborhood.neighborhood_log import NeighborhoodLog

def test_neighborhood_log_():
    # Create painter trackers. painter_id: str, position: Position, paint_count: int
    painter_tracker_1 = PainterTracker("painter-1", Position(0,0,'east'), 3)
    painter_tracker_2 = PainterTracker("painter-2", Position(0,1,'south'),0)
    grid_size = 2
    final_output =  [[None for _ in range(grid_size)] for _ in range(grid_size)]
    final_output[0][1] = 'Red'
    expected_output = [[None for _ in range(grid_size)] for _ in range(grid_size)]
    expected_output[0][1] = 'red'
    neighborhood_log = NeighborhoodLog([painter_tracker_1, painter_tracker_2], final_output)
    assert len(neighborhood_log.painter_logs) == 2
    assert neighborhood_log.final_output_matches(expected_output) is True
    expected_output[0][1] = 'Green'
    assert neighborhood_log.final_output_matches(expected_output) is False
    expected_paint_output = [[False for _ in range(grid_size)] for _ in range(grid_size)]
    expected_paint_output[0][1] = True
    assert neighborhood_log.final_output_contains_paint(expected_paint_output) is True
    expected_paint_output[0][1] = False
    assert neighborhood_log.final_output_contains_paint(expected_paint_output) is False
    
