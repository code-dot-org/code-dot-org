import os
import jsonlines
import numpy as np
from src.config import DATA_DIR
from src.trainer.utils import train_test_split
from src.codeorg_utils.utils import (
    toCodeString,
    formatTokensFromOutput,
)


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('data_jsonl', type=str, help='file of JSON lines')
    args = parser.parse_args()

    with jsonlines.open(args.data_jsonl, 'r') as reader:
        programs = []
        rubrics   = []
        all_rubrics = []
        for row in reader:
            raw_program = row['text']
            tokens = formatTokensFromOutput(raw_program)
            program = toCodeString(tokens)
            programs.append(program)
            rubrics.append(row['rubric'].keys())
            all_rubrics.extend(row['rubric'].keys())

    all_rubrics = list(set(rubrics))
    num_labels = len(all_rubrics)

    num = len(programs)
    labels = []
    for i in range(num):
        label = np.zeros(num_labels)
        for rubric in rubrics[i]:
            ix = all_rubrics.index(rubric)
            label[ix] = 1
        labels.append(label)

    programs = np.array(programs)
    labels = np.array(labels)

    train_list, test_list = train_test_split(
        [programs, labels],
        train_frac=0.9,
        val_frac=0,
        test_frac=0.1,
    )

    train_programs, train_labels = train_list[0], train_list[1]
    test_programs, test_labels = test_list[0], test_list[1]

    train_data = {'program': train_programs, 'label': train_labels}
    test_data = {'program': test_programs, 'label': test_labels}

    train_path = os.path.join(DATA_DIR, 'train_data.npz')
    test_path = os.path.join(DATA_DIR, 'test_data.npz')

    np.savez(train_path, train_data)
    np.savez(test_path, test_data)
