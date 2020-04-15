import json
import torch
from flask import Flask
from flask_cors import CORS

from config import MODEL_FILE, RUBRIC_FILE
from rubric.src.trainer.models import FeedbackNN


checkpoint = torch.load(MODEL_FILE, map_location='cpu')
vocab_size = checkpoint['vocab_size']
num_labels = checkpoint['num_labels']
vocab = checkpoint['vocab']
model = FeedbackNN(vocab_size, num_labels)
model.load_state_dict(checkpoint['state_dict'])
model.eval()

with open(RUBRIC_FILE, 'r') as fp:
    rubric_labels = json.load(fp)

app = Flask(__name__)
CORS(app)
from app import views
