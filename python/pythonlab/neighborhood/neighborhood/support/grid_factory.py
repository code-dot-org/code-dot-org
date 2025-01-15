import json

from .exception_key import ExceptionKey
from .grid import Grid
from .grid_helpers import is_square_2d_array
from .grid_square import GridSquare
from .neighborhood_runtime_exception import NeighborhoodRuntimeException

class GridFactory:
  GRID_FILE_NAME = 'serialized_maze.txt'
  GRID_SQUARE_TYPE_FIELD = 'tileType'
  GRID_SQUARE_ASSET_ID_FIELD = 'assetId'
  GRID_SQUARE_VALUE_FIELD = 'value'

  # Creates a grid from a string, assuming that the string is a 2d array of JSON objects,
  # with each JSON object containing an integer tileType and optionally an integer value
  # corresponding with the paintCount for that tile.
  def create_grid_from_string(self, description: str) -> Grid:
      try:
          grid_squares = json.loads(description)
          height = len(grid_squares)
          if height == 0:
              raise NeighborhoodRuntimeException(ExceptionKey.INVALID_GRID, "Grid is empty")
          
          if not is_square_2d_array(grid_squares)
              raise NeighborhoodRuntimeException(ExceptionKey.INVALID_GRID, "Grid is not a square")
          
          # # Initialize the grid array (list of lists in Python)
          # grid = [[None] * height for _ in range(width)]
          
          # # Iterate over each line and column to populate the grid
          # for current_y in range(height):
          #     line = grid_squares[current_y]
          #     if len(line) != width:
          #         raise NeighborhoodRuntimeException(ExceptionKey.INVALID_GRID)
              
          #     for current_x in range(len(line)):
          #         descriptor = line[current_x]
          #         try:
          #             # Parse the tile type and asset ID
          #             tile_type = int(descriptor[self.GRID_SQUARE_TYPE_FIELD])
          #             asset_id = 0
          #             if self.GRID_SQUARE_ASSET_ID_FIELD in descriptor:
          #                 asset_id = int(descriptor[self.GRID_SQUARE_ASSET_ID_FIELD])
                      
          #             # Parse the value if it exists
          #             if self.GRID_SQUARE_VALUE_FIELD in descriptor:
          #                 value = int(descriptor[self.GRID_SQUARE_VALUE_FIELD])
          #                 grid[current_x][current_y] = GridSquare(tile_type, asset_id, value)
          #             else:
          #                 grid[current_x][current_y] = GridSquare(tile_type, asset_id)
                  
          #         except (ValueError, KeyError) as e:
          #             raise NeighborhoodRuntimeException(ExceptionKey.INVALID_GRID) from e
          
          # Return the grid as a Grid object
          # return Grid(grid)
      
      except json.JSONDecodeError:
          raise NeighborhoodRuntimeException(ExceptionKey.INVALID_GRID)