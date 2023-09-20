#!/usr/bin/env python

import argparse
import csv
import glob
import json
import time
import os
from multiprocessing import Pool
import concurrent.futures
import io

from config import SUPPORTED_MODELS, VALID_GRADES
from grade import Grade
from report import Report


def command_line_options():
    parser = argparse.ArgumentParser(description='Usage')

    parser.add_argument('-o', '--output-filename', type=str, default='report.html',
                        help='Output filename within output directory')
    parser.add_argument('-c', '--use-cached', action='store_true',
                        help='Use cached responses from the API.')
    parser.add_argument('-l', '--llm-model', type=str, default='gpt-4',
                        help=f"Which LLM model to use. Supported models: {', '.join(SUPPORTED_MODELS)}. Default: gpt-4")
    parser.add_argument('-n', '--num-responses', type=int, default=1,
                        help='Number of responses to generate for each student. Defaults to 1.')
    parser.add_argument('-p', '--num-passing-grades', type=int,
                        help='Number of grades which are considered passing.')
    parser.add_argument('-s', '--max-num-students', type=int, default=100,
                        help='Maximum number of students to grade. Defaults to 100 students.')
    parser.add_argument('--student-ids', type=str,
                        help='Comma-separated list of student ids to grade. Defaults to all students.')
    parser.add_argument('-t', '--temperature', type=float, default=0.0,
                        help='Temperature of the LLM. Defaults to 0.0.')

    args = parser.parse_args()

    if args.llm_model not in SUPPORTED_MODELS:
        raise Exception(f"Unsupported LLM model: {args.llm_model}. Supported models are: {', '.join(SUPPORTED_MODELS)}")

    args.passing_grades = get_passing_grades(args.num_passing_grades)

    if args.student_ids:
        args.student_ids = args.student_ids.split(',')

    return args


def get_passing_grades(num_passing_grades):
    if num_passing_grades:
        return VALID_GRADES[:num_passing_grades]
    else:
        return None


def read_inputs(prompt_file, standard_rubric_file):
    with open(prompt_file, 'r') as f:
        prompt = f.read()

    with open(standard_rubric_file, 'r') as f:
        standard_rubric = f.read()

    return prompt, standard_rubric


def get_student_files(max_num_students, student_ids=None):
    if student_ids:
        return [f"sample_code/{student_id}.js" for student_id in student_ids]
    else:
        return sorted(glob.glob('sample_code/*.js'))[:max_num_students]


def get_expected_grades(expected_grades_file):
    expected_grades = {}
    with open(expected_grades_file, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            student_id = row['student']
            expected_grades[student_id] = dict(row)
    return expected_grades


def get_examples():
    example_js_files = sorted(glob.glob('examples/*.js'))
    examples = []
    for example_js_file in example_js_files:
        example_id = os.path.splitext(os.path.basename(example_js_file))[0]
        with open(example_js_file, 'r') as f:
            example_code = f.read()
        with open(f"examples/{example_id}.tsv", 'r') as f:
            example_rubric = f.read()
        examples.append((example_code, example_rubric))
    return examples


def validate_rubrics(expected_grades, standard_rubric):
    expected_concepts = sorted(list(list(expected_grades.values())[0].keys())[1:])
    standard_rubric_filelike = io.StringIO(standard_rubric)  # convert string to file-like object
    standard_rubric_dicts = list(csv.DictReader(standard_rubric_filelike))
    standard_concepts = sorted([rubric_dict["Key Concept"] for rubric_dict in standard_rubric_dicts])
    if standard_concepts != expected_concepts:
        raise Exception(f"standard concepts do not match expected concepts:\n{standard_concepts}\n{expected_concepts}")

def validate_students(student_files, expected_grades):
    expected_students = sorted(expected_grades.keys())
    actual_students = sorted([os.path.splitext(os.path.basename(student_file))[0] for student_file in student_files])

    unexpected_students = list(set(actual_students) - set(expected_students))
    if unexpected_students:
        raise Exception(f"unexpected students: {unexpected_students}")


def compute_accuracy(expected_grades, actual_grades, passing_grades):
    overall_total = 0
    overall_matches = 0
    matches_by_criteria = {}
    total_by_criteria = {}

    for student_id, student in actual_grades.items():
        for row in student:
            criteria = row['Key Concept']
            total_by_criteria[criteria] = total_by_criteria.get(criteria, 0) + 1
            overall_total += 1

            if Report.accurate(expected_grades[student_id][criteria], row['Grade'], passing_grades):
                matches_by_criteria[criteria] = matches_by_criteria.get(criteria, 0) + 1
                overall_matches += 1

    accuracy_by_criteria = {}
    for criteria, total in total_by_criteria.items():
        matches = matches_by_criteria.get(criteria, 0)
        accuracy_by_criteria[criteria] = (matches / total) * 100

    overall_accuracy = (overall_matches / overall_total) * 100

    return accuracy_by_criteria, overall_accuracy


def grade_student_work(prompt, rubric, student_file, examples, options):
    student_id = os.path.splitext(os.path.basename(student_file))[0]
    with open(student_file, 'r') as f:
        student_code = f.read()
    grade = Grade()
    grades = grade.grade_student_work(
        prompt,
        rubric,
        student_code,
        student_id,
        examples=examples,
        use_cached=options.use_cached,
        llm_model=options.llm_model,
        num_responses=options.num_responses,
        temperature=options.temperature
    )
    return student_id, grades


def main():
    command_line = " ".join(os.sys.argv)
    options = command_line_options()

    main_start_time = time.time()
    prompt_file = 'system_prompt.txt'
    standard_rubric_file = 'standard_rubric.csv'
    expected_grades_file = 'expected_grades.csv'
    output_file = "output/{}".format(options.output_filename)

    os.makedirs('cached_responses', exist_ok=True)
    if not options.use_cached:
        for file in glob.glob('cached_responses/*'):
            os.remove(file)

    prompt, standard_rubric = read_inputs(prompt_file, standard_rubric_file)
    student_files = get_student_files(max_num_students=options.max_num_students, student_ids=options.student_ids)
    expected_grades = get_expected_grades(expected_grades_file)
    examples = get_examples()

    validate_rubrics(expected_grades, standard_rubric)
    validate_students(student_files, expected_grades)

    rubric = standard_rubric

    with concurrent.futures.ThreadPoolExecutor(max_workers=7) as executor:
        actual_grades = list(executor.map(lambda student_file: grade_student_work(prompt, rubric, student_file, examples, options), student_files))

    errors = [student_id for student_id, grades in actual_grades if not grades]
    actual_grades = {student_id: grades for student_id, grades in actual_grades if grades}

    accuracy_by_criteria, overall_accuracy = compute_accuracy(expected_grades, actual_grades, options.passing_grades)
    report = Report()
    report.generate_html_output(
        output_file, prompt, rubric, overall_accuracy, actual_grades, expected_grades, options.passing_grades, accuracy_by_criteria, errors, command_line
    )
    print(f"main finished in {int(time.time() - main_start_time)} seconds")

    os.system(f"open {output_file}")


if __name__ == '__main__':
    main()
