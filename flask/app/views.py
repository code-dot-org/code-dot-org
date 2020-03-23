from app import app

@app.route('/')
@app.route('/index')
def index():
    return "rubric sampling for code.org"
