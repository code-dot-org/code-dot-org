# Normal imports
import csv, glob, json, time, os
from multiprocessing import Pool
import concurrent.futures
import io
import json

# Import our support classes
from config import SUPPORTED_MODELS, VALID_GRADES
from grade import Grade
from report import Report
from rubric_tester import (
    read_inputs,
    get_expected_grades,
    get_examples,
    get_passing_grades,
    get_student_files,
    validate_rubrics,
    validate_students,
    grade_student_work,
    compute_accuracy
)

def grade(code, prompt, rubric, api_key='', llm_model='gpt-4', num_responses=1, temperature=0.2, num_passing_grades=2):
  OPENAI_API_KEY = api_key

  # Set the key
  if OPENAI_API_KEY:
    os.environ['OPENAI_API_KEY'] = OPENAI_API_KEY
  elif not 'OPENAI_API_KEY' in os.environ:
    print("Must set OPENAI_API_KEY!")
    return -1
  else:
    print("Using set OPENAI_API_KEY")

  grade = Grade()
  grades = grade.grade_student_work(prompt, rubric, code, "student", [], use_cached=False, num_responses=num_responses, temperature=temperature, llm_model=llm_model)
  return json.dumps(grades)
