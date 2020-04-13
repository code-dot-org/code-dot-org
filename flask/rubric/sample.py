import os, jsonlines
from src.rubric_utils.sampler import Sampler
from src.config import DATA_DIR


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('grammar', type=str, help='path to grammar')
    parser.add_argument('--num-samples', type=int, default=10)
    args = parser.parse_args()

    assert os.path.isdir(args.grammar)
    sampler = Sampler(args.grammar)

    for i in range(args.num_samples):
        sample = sampler.singleSample()
        print(sample)
