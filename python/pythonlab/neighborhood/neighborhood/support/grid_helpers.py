class GridHelpers:
    @staticmethod
    def is_square_2d_array(squares: list[list[any]]) -> bool:
        """
        Validate the the given 2d array is a square.
        """
        height = len(squares)
        for y in range(height):
            if len(squares[y]) != height:
                return False
        return True