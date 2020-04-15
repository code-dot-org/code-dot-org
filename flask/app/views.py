from app import app
from app.utils.xml_parser import xmlToAst
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
        xml = data['code']
        ast = xmlToAst(xml)
        print(ast)

    response = {
        'hint': ' '.join(ast.toTrainableInput()),
    }
    return make_response(jsonify(response))
