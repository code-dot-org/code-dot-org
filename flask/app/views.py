from app import app
from app.utils.xml_parser import xmlToAst
from flask import (
    request, 
    Response,
    make_response,
    jsonify,
)
import json
from app.infer import infer
from rubric.src.codeorg_utils.utils import (
    toCodeString,
    formatTokensFromOutput,
)


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
        code = ast.toString(0).strip()
        tokens = formatTokensFromOutput(code)
        program = toCodeString(tokens)
        programTokens = program.split()
        probs = infer(programTokens)

    response = {
        'hint': code,
    }
    return make_response(jsonify(response))
