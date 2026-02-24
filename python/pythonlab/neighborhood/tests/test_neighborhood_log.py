from neighborhood.painter_log import PainterLog
from neighborhood.position import Position
from neighborhood.neighborhood_log import NeighborhoodLog
from neighborhood.support.neighborhood_signal_message import NeighborhoodSignalMessage
from neighborhood.support.signal_message_type import SignalMessageType
from neighborhood.support.neighborhood_signal_key import NeighborhoodSignalKey

def test_neighborhood_log_():
    # Set up
    position = Position(0,0,'east')
    move_signal = NeighborhoodSignalMessage(SignalMessageType.NEIGHBORHOOD, NeighborhoodSignalKey.MOVE, {"id": "painter-1", "direction": "east"})
    turn_left_signal = NeighborhoodSignalMessage(SignalMessageType.NEIGHBORHOOD, NeighborhoodSignalKey.TURN_LEFT, {"id": "painter-1", "direction": "north"})
    painter_log_1 = PainterLog("painter-1", position, position, 0, 0, [move_signal, turn_left_signal])
    painter_log_2 = PainterLog("painter-2", position, position, 0, 0, [move_signal])
    grid_size = 2
    final_output =  [[None for _ in range(grid_size)] for _ in range(grid_size)]
    final_output[0][1] = 'Red'
    expected_output = [[None for _ in range(grid_size)] for _ in range(grid_size)]
    expected_output[0][1] = 'red'

    neighborhood_log = NeighborhoodLog([painter_log_1, painter_log_2], final_output)
    assert len(neighborhood_log.painter_logs) == 2
    assert neighborhood_log.final_output_matches(expected_output) is True
    expected_output[0][1] = 'Green'
    assert neighborhood_log.final_output_matches(expected_output) is False
    expected_paint_output = [[False for _ in range(grid_size)] for _ in range(grid_size)]
    expected_paint_output[0][1] = True
    assert neighborhood_log.final_output_contains_paint(expected_paint_output) is True
    expected_paint_output[0][1] = False
    assert neighborhood_log.final_output_contains_paint(expected_paint_output) is False

    assert neighborhood_log.one_painter_did_action('MOVE', 1) is True
    assert neighborhood_log.one_painter_did_action('MOVE', 2) is False
    assert neighborhood_log.action_happened('MOVE', 2) is True