from .painter_log import PainterLog

class NeighborhoodLog:
    """
    User-facing class that represents the results of a neighborhood project run. Includes
    helper functions for analyzing the actions painter(s) took in the neighborhood.
    """
    def __init__(self, painter_logs: list[PainterLog], final_output: list[list[str | None]]):
        self.painter_logs = painter_logs
        self.final_output = final_output

    def one_painter_did_action(self, neighborhood_signal_message_value: str, times: int) -> bool:
        """Returns True if one of the painters did the action exactly 'times' times."""
        for painter_log in self.painter_logs:
            if painter_log.did_action_exactly(neighborhood_signal_message_value, times):
                return True 
        return False  

    def action_happened(self, neighborhood_signal_message_value: str, times:int) -> bool:
        """Returns True if the action occurred exactly 'times' times."""
        signal_count = 0
        for painter_log in self.painter_logs:
            signal_count += painter_log.signal_counts.get(neighborhood_signal_message_value, 0)
        return signal_count == times

    def final_output_matches(self, expected_output: list[list[str | None]]) -> bool:
        """Returns True if the expected output matches the final output."""
        if len(expected_output) != len(self.final_output):
            return False        
        for i in range(len(expected_output)):
            expected_row = expected_output[i]
            actual_row = self.final_output[i]
            if len(expected_row) != len(actual_row):
                return False
            for j in range(len(expected_row)):
                expected_val = expected_row[j]
                actual_val = actual_row[j]
                # If both values are strings - convert to lowercase and then compare.
                if isinstance(expected_val, str) and isinstance(actual_val, str):
                    if expected_val.lower() != actual_val.lower():
                        return False
                elif expected_val != actual_val:  # Direct comparison for None or mismatched types
                    return False
        return True

    def final_output_contains_paint(self, expected_output: list[list[bool]]) -> bool:
        """
        Return True if for every cell in expected_output:
        - If expected_output[i][j] is True, final_output[i][j] must have a non-None value.
        - If expected_output[i][j] is False, final_output[i][j] must be None.
        """
        if len(expected_output) != len(self.final_output):
            return False        
        for i in range(len(expected_output)):
            expected_row = expected_output[i]
            actual_row = self.final_output[i]
            if len(expected_row) != len(actual_row):
                return False
            for j in range(len(expected_row)):
                cell_has_paint = actual_row[j] is not None
                if expected_row[j] != cell_has_paint:
                    return False
        return True
