"""Train on synthetically generated data"""

import os
import pickle

from src.trainer.models import FeedbackNN
from src.config import TRAINING_PARAMS, DATA_DIR

from src import trainer


if __name__ == "__main__":
    train_data_path = os.path.join(DATA_DIR, 'train_data.pickle')
    test_data_path = os.path.join(DATA_DIR, 'test_data.pickle')

    trainer.train_pipeline(
        FeedbackNN,
        train_data_path,
        test_data_path,
        TRAINING_PARAMS,
    )