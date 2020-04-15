import json
from flask import Flask
from flask_cors import CORS

from config import MODEL_FILE, RUBRIC_FILE
from rubric.src.trainer.models import FeedbackNN

model = FeedbackNN()
checkpoint = torch.load(MODEL_FILE, map_location='cpu')
model.load_state_dict(checkpoint['state_dict'])
model.eval()

with open(RUBRIC_FILE, 'r') as fp:
    rubric = json.load(fp)

app = Flask(__name__)
CORS(app)
from app import views
