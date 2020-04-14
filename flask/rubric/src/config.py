import os

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
CHECKPOINT_DIR = os.path.join(os.path.dirname(__file__), '..', 'checkpoints')

TRAINING_PARAMS = {
    'batch_size': 256,
    'epochs': 10,       # number of loops through synthetic data
    'lr': 1e-3,         # learning rate
    'max_grad_norm': 5,
    "weight_decay": 1e-4,
    'seed': 1,
    'max_seq_len': 50,  # maximum number of tokens allowed in a single sequence
    'min_occ': 1,       # minimum number of occurences to add a token into the vocab
    'out_dir': CHECKPOINT_DIR,  # where to train the model
    'cuda': False,
}
