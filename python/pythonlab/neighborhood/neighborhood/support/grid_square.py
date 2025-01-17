from .color_helpers import is_color
from .neighborhood_runtime_exception import NeighborhoodRuntimeException
from .exception_key import ExceptionKey
from .square_type import SquareType

class GridSquare:

    def __init__(self, tile_type: int, asset_id: int, value: int | None = 0):
        self.set_tile_type(tile_type)
        self.asset_id = asset_id
        self.paint_count = value
        self.color = None

    def set_color(self, color: str):
        if not is_color(color):
            raise NeighborhoodRuntimeException(ExceptionKey.INVALID_COLOR)
        if self.contains_paint():
            raise NeighborhoodRuntimeException(ExceptionKey.INVALID_PAINT_LOCATION)
        if self.passable and self.paint_count == 0:
            self.color = color

    def is_passable(self) -> bool:
        return self.passable

    def collect_paint(self):
        if self.contains_paint():
            self.paint_count -= 1
        else:
            print("There's no paint to collect here")

    def remove_paint(self):
        if self.color is not None:
            self.color = None
        else:
            print("There's no paint to remove here")

    def contains_paint(self) -> bool:
        return self.paint_count > 0

    def get_printable_description(self) -> str:
        if not self.passable:
            return "x"
        elif self.color is not None:
            return self.color
        else:
            return str(self.paint_count)

    def has_color(self) -> bool:
        return self.color is not None

    def get_color(self) -> str:
        return self.color

    def set_tile_type(self, tile_type: int):
        if tile_type == 0:
            self.square_type = SquareType.WALL
            self.passable = False
        elif tile_type == 1:
            self.square_type = SquareType.OPEN
            self.passable = True
        elif tile_type == 2:
            self.square_type = SquareType.START
            self.passable = True
        elif tile_type == 3:
            self.square_type = SquareType.FINISH
            self.passable = True
        elif tile_type == 4:
            self.square_type = SquareType.OBSTACLE
            self.passable = False
        elif tile_type == 5:
            self.square_type = SquareType.STARTANDFINISH
            self.passable = True
        else:
            self.square_type = SquareType.UNKNOWN
            self.passable = False
