from app import app
from flask import request, Response
import json


@app.route('/')
@app.route('/index')
def index():
    return "rubric sampling for code.org"


@app.route('/predict', methods=['POST'])
def predict():
    response = {
        'hint': 'placeholder',
    }
    return Response(response=response)
