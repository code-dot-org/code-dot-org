import sys
import numpy as np

import torch
import torch.nn as nn
from torch.nn import functional as F
import torch.nn.utils.rnn as rnn_utils


class FeedbackNN(nn.Module):

    def __init__(
            self, 
            vocab_size, 
            num_labels,
            rep_size = 128,
            embedding_dim = 300,
            hidden_dim = 256,
            bidirectional = True,
            num_layers = 2,
            num_highways = 2,
        ):
        super().__init__()

        self.encoder = BlockyEncoder(
            vocab_size, 
            out_dim = rep_size,
            embedding_dim = embedding_dim, 
            hidden_dim = hidden_dim, 
            bidirectional = bidirectional,
            num_layers = num_layers,
            num_highways = num_highways,
        )
        self.decoder = LabelPredictor(
            rep_size,
            num_labels,
            hidden_dim = hidden_dim,
        )
        
        self.vocab_size = vocab_size
        self.num_labels = num_labels
        self.embedding_dim = embedding_dim
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers

    def forward(self, token_seq, token_length):
        rep = self.encoder(token_seq, token_length)
        return self.decoder(rep)


class BlockyEncoder(nn.Module):

    def __init__(
            self,
            vocab_size,
            embedding_dim = 300,
            hidden_dim = 256,
            bidirectional = True,
            num_layers = 2,
            num_highways = 2,
        ):
        super(BlockyEncoder, self).__init__()

        self.highway = Highway(embedding_dim, num_highways)

        self.embedding = nn.Embedding(vocab_size, embedding_dim)
        self.gru = nn.LSTM(
            embedding_dim, 
            hidden_dim, 
            num_layers = num_layers, 
            bidirectional = bidirectional,
            batch_first = True,
        )
        layer_dim = num_layers * (2 if bidirectional else 1) * hidden_dim
        self.linear_out = nn.Linear(layer_dim * 2, hidden_dim)

        self.embedding_dim = self.embedding.embedding_dim
        self.z_dim = z_dim
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        self.layer_dim = layer_dim

    def ziphidden(self, hidden, cell):
        batch_size = hidden.size(1)
        # hidden : n_layers x batch_size x hid_dim
        # cell   : n_layers x batch_size x hid_dim
        # h      : n_layers x batch_size x hid_dim * 2
        h = torch.cat((hidden, cell), dim=2)
        h = torch.transpose(h, 0, 1).contiguous()
        # h      : batch_size x n_layers * hid_dim * 2
        h = h.view(batch_size, -1)
        return h

    def forward(self, seq, length):
        # seq : batch_size x max_sent_len
        batch_size = seq.size(0)

        # embed_seq : batch_size x max_sent_len x embedding_dim
        embed_seq = self.embedding(seq)
        embed_seq = self.highway(embed_seq)

        packed = rnn_utils.pack_padded_sequence(
            embed_seq,
            length.data.tolist(),
            batch_first = True,
            enforce_sorted = False,
        )

        # hidden : num_layers x batch_size x hidden_dim
        _, hidden_lstm = self.gru(packed)
        hidden = self.ziphidden(*hidden_lstm)

        return self.linear_out(hidden)


class LabelPredictor(nn.Module):

    def __init__(self, input_dim, num_labels, hidden_dim=256):
        super(LabelPredictor, self).__init__()

        self.predictor = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.LeakyReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.LeakyReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.LeakyReLU(),
            nn.Linear(hidden_dim, num_labels),
        )
        self.input_dim = input_dim
        self.num_labels = num_labels
        self.hidden_dim = hidden_dim

    def forward(self, input):
        # we assume binary labels
        return torch.sigmoid(self.predictor(input))


class Highway(nn.Module):

    def __init__(self, emb_dim, n_highway):
        super(Highway, self).__init__()
        self.non_linear = nn.ModuleList([nn.Linear(emb_dim, emb_dim) for _ in range(n_highway)])
        self.linear = nn.ModuleList([nn.Linear(emb_dim, emb_dim) for _ in range(n_highway)])
        self.gate = nn.ModuleList([nn.Linear(emb_dim, emb_dim) for _ in range(n_highway)])
        self.n_highway = n_highway

    def forward(self, x):
        for layer in range(self.n_highway):
            # Compute percentage of non linear information to be allowed for each element in x
            gate = torch.sigmoid(self.gate[layer](x))
            # Compute non linear information
            non_linear = F.relu(self.non_linear[layer](x))
            # Compute linear information
            linear = self.linear[layer](x)
            #Combine non linear and linear information according to gate
            x = gate*non_linear + (1-gate)*linear

        return x