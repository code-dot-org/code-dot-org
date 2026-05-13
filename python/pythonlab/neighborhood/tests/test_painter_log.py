from neighborhood.painter_log import PainterLog
from neighborhood.position import Position
from neighborhood.support.neighborhood_signal_message import NeighborhoodSignalMessage
from neighborhood.support.signal_message_type import SignalMessageType
from neighborhood.support.neighborhood_signal_key import NeighborhoodSignalKey
from neighborhood.painter_event import PainterEvent

def test_painter_log_():
    move_signal = NeighborhoodSignalMessage(SignalMessageType.NEIGHBORHOOD, NeighborhoodSignalKey.MOVE, {"id": "painter-1", "direction": "east"})
    turn_left_signal = NeighborhoodSignalMessage(SignalMessageType.NEIGHBORHOOD, NeighborhoodSignalKey.TURN_LEFT, {"id": "painter-1", "direction": "north"})
    move_2_signal = NeighborhoodSignalMessage(SignalMessageType.NEIGHBORHOOD, NeighborhoodSignalKey.MOVE, {"id": "painter-1", "direction": "north"})
    position = Position(0,0,"east")
    signals = [move_signal, turn_left_signal, move_2_signal]

    painter_log = PainterLog("painter-1", position, position, 2, 2, signals)
    assert painter_log.did_action_once('TURN_LEFT') is True
    assert painter_log.did_action_exactly('MOVE', 2) is True
    assert painter_log.did_action_once('PAINT') is False
    assert painter_log.action_count('TURN_LEFT') == 1
    assert painter_log.action_count('MOVE') == 2
    assert painter_log.action_count('PAINT') == 0
    assert painter_log.did_action_at_least('MOVE', 2) is True
    assert painter_log.did_action_at_least('MOVE', 1) is True
    assert painter_log.did_action_at_least('MOVE', 3) is False

    events = painter_log.get_events()
    assert isinstance(events[0], PainterEvent) is True
    assert events[0].neighborhood_action_type == 'MOVE'
    assert len(events) == 3
