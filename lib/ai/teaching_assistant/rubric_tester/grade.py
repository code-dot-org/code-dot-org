import os
import json
import csv
import time
import requests

from typing import List, Dict, Any
from config import VALID_GRADES

class InvalidResponseError(Exception):
    pass

class Grade:
    def __init__(self):
        pass

    def grade_student_work(self, prompt, rubric, student_code, student_id, examples=[], use_cached=False, num_responses=0, temperature=0.0, llm_model=""):
        # if use_cached and os.path.exists(f"cached_responses/{student_id}.json"):
        #     with open(f"cached_responses/{student_id}.json", 'r') as f:
        #         return json.load(f)

        api_url = 'https://api.openai.com/v1/chat/completions'
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f"Bearer {os.getenv('OPENAI_API_KEY')}"
        }

        messages = self.compute_messages(prompt, rubric, student_code, examples=examples)
        data = {
            'model': llm_model,
            'temperature': temperature,
            'messages': messages,
            'n': num_responses,
        }

        start_time = time.time()
        try:
            response = requests.post(api_url, headers=headers, json=data, timeout=120)
        except requests.exceptions.ReadTimeout:
            print(f"{student_id} request timed out in {(time.time() - start_time):.0f} seconds.")
            return None

        if response.status_code != 200:
            print(f"{student_id} Error calling the API: {response.status_code}")
            print(f"{student_id} Response body: {response.text}")
            return None

        tokens = response.json()['usage']['total_tokens']
        print(f"{student_id} request succeeded in {(time.time() - start_time):.0f} seconds. {tokens} tokens used.")

        tsv_data_choices = [self.get_tsv_data_if_valid(choice['message']['content'], rubric, student_id, choice_index=index) for index, choice in enumerate(response.json()['choices']) if choice['message']['content']]
        tsv_data_choices = [choice for choice in tsv_data_choices if choice]

        if len(tsv_data_choices) == 0:
            tsv_data = None
        elif len(tsv_data_choices) == 1:
            tsv_data = tsv_data_choices[0]
        else:
            tsv_data = self.get_consensus_response(tsv_data_choices, student_id)

        # only write to cache if the response is valid
        # if tsv_data:
        #     with open(f"cached_responses/{student_id}.json", 'w') as f:
        #         json.dump(tsv_data, f, indent=4)

        return tsv_data

    def compute_messages(self, prompt, rubric, student_code, examples=[]):
        messages = [
            {'role': 'system', 'content': f"{prompt}\n\nRubric:\n{rubric}"}
        ]
        for example_js, example_rubric in examples:
            messages.append({'role': 'user', 'content': example_js})
            messages.append({'role': 'assistant', 'content': example_rubric})
        messages.append({'role': 'user', 'content': student_code})
        return messages

    def get_tsv_data_if_valid(self, response_text, rubric, student_id, choice_index=None):
        choice_text = f"Choice {choice_index}: " if choice_index is not None else ''
        if not response_text:
            print(f"{student_id} {choice_text} Invalid response: empty response")
            return None
        print(response_text.strip())
        tsv_data = self.parse_tsv(response_text.strip())
        try:
            self.validate_server_response(tsv_data, rubric)
            return [row for row in tsv_data]
        except InvalidResponseError as e:
            print(f"{student_id} {choice_text} Invalid response: {str(e)}\n{response_text}")
            return None

    def parse_tsv(self, tsv_text):
        rows = [row.strip('\r') for row in tsv_text.split("\n")]
        header = rows.pop(0).split("\t")
        return [dict(zip(header, row.split("\t"))) for row in rows]

    def validate_server_response(self, tsv_data, rubric):
        expected_columns = ["Key Concept", "Observations", "Grade", "Reason"]

        rubric_key_concepts = list(set(row['Key Concept'] for row in csv.DictReader(rubric.splitlines())))

        if not isinstance(tsv_data, list):
            raise InvalidResponseError('invalid format')

        if not all((set(row.keys()) & set(expected_columns)) == set(expected_columns) for row in tsv_data):
            raise InvalidResponseError('incorrect column names')

        key_concepts_from_response = list(set(row["Key Concept"] for row in tsv_data))
        if sorted(rubric_key_concepts) != sorted(key_concepts_from_response):
            raise InvalidResponseError('invalid or missing key concept')

        for row in tsv_data:
            if row["Grade"] not in VALID_GRADES:
                raise InvalidResponseError(f"invalid grade value: {row['Grade']}")

    def get_consensus_response(self, choices, student_id):
        from collections import Counter

        key_concept_to_grades = {}
        for choice in choices:
            for row in choice:
                if row['Key Concept'] not in key_concept_to_grades:
                    key_concept_to_grades[row['Key Concept']] = []
                key_concept_to_grades[row['Key Concept']].append(row['Grade'])

        key_concept_to_majority_grade = {}
        for key_concept, grades in key_concept_to_grades.items():
            majority_grade = Counter(grades).most_common(1)[0][0]
            key_concept_to_majority_grade[key_concept] = majority_grade
            if majority_grade != grades[0]:
                print(f"outvoted {student_id} Key Concept: {key_concept} first grade: {grades[0]} majority grade: {majority_grade}")

        key_concept_to_observations = {}
        key_concept_to_reason = {}
        for choice in choices:
            for row in choice:
                key_concept = row['Key Concept']
                if key_concept_to_majority_grade[key_concept] == row['Grade']:
                    if key_concept not in key_concept_to_observations:
                        key_concept_to_observations[key_concept] = row['Observations']
                    key_concept_to_reason[key_concept] = row['Reason']

        return [{'Key Concept': key_concept, 'Observations': key_concept_to_observations[key_concept], 'Grade': grade, 'Reason': f"<b>Votes: [{', '.join(key_concept_to_grades[key_concept])}]</b><br>{key_concept_to_reason[key_concept]}"} for key_concept, grade in key_concept_to_majority_grade.items()]
