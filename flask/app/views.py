from app import app
from flask import (
    request, 
    Response,
    make_response,
    jsonify,
)
import json


@app.route('/')
@app.route('/index')
def index():
    return "rubric sampling for code.org"


@app.route('/predict', methods=['GET', 'POST'])
def predict():
    if len(request.data) > 0:
        data = json.loads(request.data)
        code = data['code']
        print('---------------\n')
        print(code)
        print('---------------\n')

    response = {
        'hint': 'placeholder',
    }
    return make_response(jsonify(response))
