from neighborhood.support.painter_tracker import PainterTracker
from neighborhood.support.neighborhood_signal_message import NeighborhoodSignalMessage
from neighborhood.support.signal_message_type import SignalMessageType
from neighborhood.support.neighborhood_signal_key import NeighborhoodSignalKey
from neighborhood.support.position import Position

def test_initialize_painter_tracker():
    painter_tracker = PainterTracker("painter-1", Position(0,0,'East'), 2)
    assert painter_tracker.get_painter_log() == 'painter_log'
    move_signal_message = NeighborhoodSignalMessage(SignalMessageType.NEIGHBORHOOD, NeighborhoodSignalKey.MOVE, {"direction": "East"})
    assert painter_tracker.current_position.x == 0
    assert painter_tracker.current_position.y == 0
    painter_tracker.track_signal(move_signal_message)
    assert painter_tracker.current_position.x == 1
    assert painter_tracker.current_position.y == 0
    take_paint_message = NeighborhoodSignalMessage(SignalMessageType.NEIGHBORHOOD, NeighborhoodSignalKey.TAKE_PAINT,{})
    assert painter_tracker.current_paint_count == 2
    painter_tracker.track_signal(take_paint_message)
    assert painter_tracker.current_paint_count == 3
    paint_message = NeighborhoodSignalMessage(SignalMessageType.NEIGHBORHOOD, NeighborhoodSignalKey.PAINT,{})
    painter_tracker.track_signal(paint_message)
    assert painter_tracker.current_paint_count == 2
    assert painter_tracker.current_position.direction == 'east'
    turn_left_message = NeighborhoodSignalMessage(SignalMessageType.NEIGHBORHOOD, NeighborhoodSignalKey.TURN_LEFT,{"direction": "north"})
    painter_tracker.track_signal(turn_left_message)
    assert painter_tracker.current_position.direction == 'north'
