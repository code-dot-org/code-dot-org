from neighborhood.support.world import World
from neighborhood.support.neighborhood_tracker import NeighborhoodTracker
from neighborhood.support.neighborhood_context_type import NeighborhoodContextType
from neighborhood.support.neighborhood_signal_message import NeighborhoodSignalMessage
from neighborhood.support.signal_message_type import SignalMessageType
from neighborhood.support.neighborhood_signal_key import NeighborhoodSignalKey
from constants import SAMPLE_MAZE

def test_initialize_neighborhood_tracker_get_log_info():
    neighborhood_world = World()
    neighborhood_world.set_grid_from_string(SAMPLE_MAZE)
    neighborhood_world.set_context_type(NeighborhoodContextType.VALIDATE)
    neighborhood_tracker = NeighborhoodTracker(neighborhood_world)
    initialize_painter_signal_message = NeighborhoodSignalMessage(SignalMessageType.NEIGHBORHOOD, NeighborhoodSignalKey.INITIALIZE_PAINTER, {"id": "painter-1", "x": 0, "y": 0, "paint": 2, "direction": "east"})
    assert neighborhood_tracker.is_initialized is False
    neighborhood_tracker.track_signal(initialize_painter_signal_message)
    neighborhood_log = neighborhood_tracker.get_neighborhood_log()   
    assert len(neighborhood_log.painter_logs) == 1
    grid_size = 2
    expected_neighborhood_state = [[None for _ in range(grid_size)] for _ in range(grid_size)]
    assert neighborhood_log.final_output_matches(expected_neighborhood_state) is True
    assert len(neighborhood_log.painter_logs) == 1
    assert neighborhood_tracker.is_initialized is True
    neighborhood_tracker.reset()
    neighborhood_world.set_context_type(NeighborhoodContextType.RUN)
    assert neighborhood_tracker.is_initialized is False
