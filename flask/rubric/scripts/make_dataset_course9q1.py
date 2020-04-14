import os, jsonlines
from tqdm import tqdm
from src.rubric_utils.sampler import Sampler
from src.config import DATA_DIR

DATASET_SIZE = 100000
GRAMMAR_DIR = 'grammars/course9q1'
OUT_DIR = 'data/course9q1'


if __name__ == '__main__':
    assert os.path.isdir(GRAMMAR_DIR)
    sampler = Sampler(GRAMMAR_DIR)

    if not os.path.isdir(OUT_DIR):
        os.makedirs(OUT_DIR)

    with jsonlines.open(os.path.join(OUT_DIR, 'data.jsonl'), 'w') as writer:
        for i in tqdm(range(DATASET_SIZE)):
            sample = sampler.singleSample()
            writer.write(sample)