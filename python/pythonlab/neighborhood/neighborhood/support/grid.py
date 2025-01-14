from .neighborhood_runtime_exception import NeighborhoodRuntimeException
from .exception_keys import ExceptionKeys

class Grid:
    def __init__(self, squares):
        self.grid = squares
        self.height = len(squares)
        self.width = len(squares[0])

    def print_grid(self):
        for y in range(self.height):
            squares = [self.grid[x][y].get_printable_description() for x in range(self.width)]
            print(",".join(squares))

    def valid_location(self, x, y):
        # A coordinate cannot be moved into if it is out of range or if the tile is not passable
        return 0 <= x < self.width and 0 <= y < self.height and self.grid[x][y].is_passable()

    def get_square(self, x, y):
        if self.valid_location(x, y):
            return self.grid[x][y]
        else:
            raise NeighborhoodRuntimeException(ExceptionKeys.GET_SQUARE_FAILED)

    def get_size(self):
        # The grid should always be a square, so the width and height should be the same
        return self.height
