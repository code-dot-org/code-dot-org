import json

from .exception_key import ExceptionKey
from .grid import Grid
from .grid_square import GridSquare
from .neighborhood_runtime_exception import NeighborhoodRuntimeException
from .grid_helpers import is_square_2d_array

DEFAULT_GRID_FILE_NAME = 'serialized_maze.txt'
GRID_SQUARE_TYPE_FIELD = 'tileType'
GRID_SQUARE_ASSET_ID_FIELD = 'assetId'
GRID_SQUARE_VALUE_FIELD = 'value'

def create_grid_from_file(filename: str | None = None) -> Grid:
    """
    Creates a grid from a file. If a filename is not provided, the default file will be used.
    """
    try:
        file_to_open = filename if filename else DEFAULT_GRID_FILE_NAME
        with open(file_to_open, 'r') as file:
            return create_grid_from_string(file.read())
    except FileNotFoundError:
        raise NeighborhoodRuntimeException(ExceptionKey.INVALID_GRID)

def create_grid_from_string(description: str) -> Grid:
    """
    Creates a grid from a string, assuming that the string is a 2d array of JSON objects,
    with each JSON object containing an integer tileType and optionally an integer value
    corresponding with the paintCount for that tile.
    """
    try:
        grid_squares = json.loads(description)
        size = len(grid_squares)
        if size == 0:
            raise NeighborhoodRuntimeException(ExceptionKey.INVALID_GRID, "Grid is empty")
        
        if not is_square_2d_array(grid_squares):
            raise NeighborhoodRuntimeException(ExceptionKey.INVALID_GRID, "Grid is not a square")
        
        grid = [[None for i in range(size)] for j in range(size)]
        
        # Populate the grid with the parsed values
        for current_y in range(size):
            row = grid_squares[current_y]
            
            for current_x in range(len(row)):
                square_descriptor = row[current_x]
                try:
                    # Parse the tile type and asset ID
                    tile_type = int(square_descriptor[GRID_SQUARE_TYPE_FIELD])
                    asset_id = 0
                    if GRID_SQUARE_ASSET_ID_FIELD in square_descriptor:
                        asset_id = int(square_descriptor[GRID_SQUARE_ASSET_ID_FIELD])

                    value = None
                    # Parse the value if it exists
                    if GRID_SQUARE_VALUE_FIELD in square_descriptor:
                        value = int(square_descriptor[GRID_SQUARE_VALUE_FIELD])

                    grid[current_x][current_y] = GridSquare(tile_type, asset_id, value)
                
                except (ValueError, KeyError):
                    raise NeighborhoodRuntimeException(ExceptionKey.INVALID_GRID)
        
        return Grid(grid)
    
    except json.JSONDecodeError:
        raise NeighborhoodRuntimeException(ExceptionKey.INVALID_GRID)