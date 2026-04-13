import heapq


class AStarResult:
    def __init__(self, path, explored_nodes):
        self.path = path
        self.explored_nodes = explored_nodes


def heuristic(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])


def get_neighbors(grid, node):
    rows = len(grid)
    cols = len(grid[0])
    r, c = node
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    neighbors = []

    for dr, dc in directions:
        nr, nc = r + dr, c + dc
        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0:
            neighbors.append((nr, nc))

    return neighbors


def reconstruct_path(came_from, current):
    path = [current]
    while current in came_from:
        current = came_from[current]
        path.append(current)
    path.reverse()
    return path


def astar(grid, start, goal):
    open_heap = []
    heapq.heappush(open_heap, (0, start))

    came_from = {}
    g_score = {start: 0}
    visited = set()
    explored_nodes = 0

    while open_heap:
        _, current = heapq.heappop(open_heap)

        if current in visited:
            continue

        visited.add(current)
        explored_nodes += 1

        if current == goal:
            return AStarResult(reconstruct_path(came_from, current), explored_nodes)

        for neighbor in get_neighbors(grid, current):
            tentative_g = g_score[current] + 1

            if tentative_g < g_score.get(neighbor, float("inf")):
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g
                f_score = tentative_g + heuristic(neighbor, goal)
                heapq.heappush(open_heap, (f_score, neighbor))

    return AStarResult([], explored_nodes)