import torch
import numpy as np
import torch.nn.functional as F
from app import model, vocab, rubric_labels


def infer(tokens):
    indices = []
    for token in tokens:
        if token in vocab['w2i']:
            index = vocab['w2i'][token]
        else:
            index = vocab['w2i']['<unk>']
        indices.append(index)

    indices = np.array(indices)
    indices = torch.from_numpy(indices).long()
    indices = indices.unsqueeze(0)
    lengths = torch.Tensor([indices.size(1)]).long()

    with torch.no_grad():
        logits = model(indices, lengths)
        probs = F.softmax(logits).squeeze()

    probs = probs.numpy()
    assert len(probs) == len(rubric_labels)
    probs_dict = dict(zip(rubric_labels, probs))

    return probs_dict
