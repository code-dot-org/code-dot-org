from src.rubric_utils.sampler import Sampler

GRAMMAR_PATH = None  # TODO: REPLACE ME


def main():
    sampler = Sampler(GRAMMAR_PATH)

    for i in range(10):
        sample = sampler.singleSample()
        text = sample['text']
        rubric = sample['rubric']
        print(text)
        print(rubric)
        print('----')


if __name__ == '__main__':
    main()
