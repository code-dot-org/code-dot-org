"""Train on synthetically generated data"""

import os
import pickle

from src.trainer.models import FeedbackNN
from src.config import TRAINING_PARAMS, DATA_DIR

from src import trainer


if __name__ == "__main__":
    train_data_path = os.path.join(DATA_DIR, 'course9q1/train_data.npz')
    test_data_path = os.path.join(DATA_DIR, 'course9q1/test_data.npz')

    trainer.train_pipeline(
        FeedbackNN,
        train_data_path,
        test_data_path,
        TRAINING_PARAMS,
    )
