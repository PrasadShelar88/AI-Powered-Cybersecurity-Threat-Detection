def is_within_bounds(grid, node):
    rows = len(grid)
    cols = len(grid[0])
    r, c = node
    return 0 <= r < rows and 0 <= c < cols


def is_free_cell(grid, node):
    r, c = node
    return grid[r][c] == 0


def validate_start_goal(grid, start, goal):
    if not is_within_bounds(grid, start):
        raise ValueError(f"Start {start} is outside the grid.")
    if not is_within_bounds(grid, goal):
        raise ValueError(f"Goal {goal} is outside the grid.")
    if not is_free_cell(grid, start):
        raise ValueError(f"Start {start} is on an obstacle.")
    if not is_free_cell(grid, goal):
        raise ValueError(f"Goal {goal} is on an obstacle.")