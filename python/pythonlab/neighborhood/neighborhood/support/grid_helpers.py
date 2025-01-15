def is_square_2d_array(squares: list[list[any]]) -> bool:
        height = len(squares)
        for y in range(height):
            if len(squares[y]) != height:
                return False
        return True