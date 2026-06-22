from .support.kmeans_signal_key import KMeansSignalKey
from .support.kmeans_signal_message import KMeansSignalMessage


class KMeans:
    """
    Student-facing API for the K-Means Clustering mini-app.

    Usage:
        from kmeans import KMeans

        model = KMeans(k=3)
        model.add_point(1.0, 2.0)
        model.add_point(4.5, 1.5)
        model.add_point(8.0, 7.0)
        model.init()

    After calling init(), control passes to the interactive buttons
    in the mini-app canvas. Students can click "Initialize Centroids",
    "Step", and "Play" to explore the algorithm.
    """

    def __init__(self, k: int):
        if k < 1:
            raise ValueError('k must be at least 1')
        self._k = k
        self._point_id = 0

    def add_point(self, x: float, y: float):
        """Add a data point to the visualization."""
        KMeansSignalMessage(
            KMeansSignalKey.ADD_POINT,
            {'x': float(x), 'y': float(y), 'id': self._point_id},
        ).send()
        self._point_id += 1

    def init(self):
        """
        Send all data to the mini-app and unlock the interactive controls.
        Call this after adding all points.
        """
        KMeansSignalMessage(
            KMeansSignalKey.READY,
            {'k': self._k},
        ).send()
