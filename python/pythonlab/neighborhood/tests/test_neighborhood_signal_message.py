from neighborhood.support.neighborhood_signal_message import NeighborhoodSignalMessage
from neighborhood.support.signal_message_type import SignalMessageType
from neighborhood.support.neighborhood_signal_key import NeighborhoodSignalKey

def test_initialize_neighborhood_signal_message():
  turn_left_signal_message = NeighborhoodSignalMessage(SignalMessageType.PAINTER, NeighborhoodSignalKey.TURN_LEFT.value)
  # Without detail field
  assert turn_left_signal_message.get_formatted_message() == '[PAINTER] TURN_LEFT'
  # With detail field
  paint_signal_message = NeighborhoodSignalMessage(SignalMessageType.PAINTER, NeighborhoodSignalKey.PAINT.value, {'color': 'blue'})
  assert paint_signal_message.get_formatted_message() == '[PAINTER] PAINT {"color": "blue"}'
