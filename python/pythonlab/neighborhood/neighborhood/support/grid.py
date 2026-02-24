from .neighborhood_runtime_exception import NeighborhoodRuntimeException
from .exception_key import ExceptionKey
from .grid_square import GridSquare
import neighborhood.support.grid_helpers as grid_helpers

class Grid:
    def __init__(self, squares: list[list[GridSquare]]):
        self.grid_squares = squares
        # The grid should not be empty.
        if len(squares) == 0:
            raise NeighborhoodRuntimeException(ExceptionKey.INVALID_GRID, "Grid is empty")
        # The grid should always be a square.
        if not grid_helpers.is_square_2d_array(squares):
            raise NeighborhoodRuntimeException(ExceptionKey.INVALID_GRID, "Grid is not a square")
        self.size = len(squares)
        

    def print_grid(self):
        for y in range(self.size):
            squares = [self.grid_squares[x][y].get_printable_description() for x in range(self.size)]
            print(",".join(squares))

    def valid_location(self, x: int, y: int) -> bool:
        # A coordinate cannot be moved into if it is out of range or if the tile is not passable
        return 0 <= x < self.size and 0 <= y < self.size and self.grid_squares[x][y].is_passable()

    def get_square(self, x: int, y: int) -> GridSquare:
        if self.valid_location(x, y):
            return self.grid_squares[x][y]
        else:
            raise NeighborhoodRuntimeException(ExceptionKey.GET_SQUARE_FAILED)

    def get_size(self) -> int:
        return self.size

