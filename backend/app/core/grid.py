import random


def generate_grid(rows, cols, obstacle_ratio=0.2, seed=None, protected_cells=None):
    if seed is not None:
        random.seed(seed)

    protected = set(protected_cells or [])
    grid = []

    for r in range(rows):
        row = []
        for c in range(cols):
            if (r, c) in protected:
                row.append(0)
            else:
                row.append(1 if random.random() < obstacle_ratio else 0)
        grid.append(row)

    return grid


def default_start_goal(rows, cols):
    return (0, 0), (rows - 1, cols - 1)