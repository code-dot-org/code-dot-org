import os, jsonlines
from src.rubric_utils.sampler import Sampler
from src.config import DATA_DIR


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('grammar', type=str, help='path to grammar')
    parser.add_argument('--num-samples', type=int, default=10)
    parser.add_argument('--out', type=str, default=DATA_DIR)

    assert os.path.isdir(args.grammar)
    sampler = Sampler(args.grammar)

    samples = []
    for i in range(args.num_samples):
        sample = sampler.singleSample()
        samples.append(sample)

    with jsonlines.open(args.out, 'w') as writer:
        writer.write_all(samples)
