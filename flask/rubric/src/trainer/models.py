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
            num_layers = 2,
        ):
        super().__init__()

        self.encoder = BlockyEncoder(
            vocab_size, 
            out_dim = rep_size,
            embedding_dim = embedding_dim, 
            hidden_dim = hidden_dim, 
            num_layers = num_layers,
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
            num_layers = 2,
        ):
        super(BlockyEncoder, self).__init__()

        self.embedding = nn.Embedding(vocab_size, embedding_dim)
        self.gru = nn.GRU(
            embedding_dim, 
            hidden_dim, 
            num_layers = num_layers, 
            batch_first = True,
        )
        self.linear_out = nn.Linear(hidden_dim * num_layers, hidden_dim)

        self.embedding_dim = self.embedding.embedding_dim
        self.z_dim = z_dim
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers

    def forward(self, seq, length):
        # seq : batch_size x max_sent_len
        batch_size = seq.size(0)

        if batch_size > 1:
            # sort in decreasing order of length in order to pack
            # sequence; if only 1 element in batch, nothing to do.
            sorted_lengths, sorted_idx = torch.sort(length, descending=True)
            seq = seq[sorted_idx]

        # embed_seq : batch_size x max_sent_len x embedding_dim
        embed_seq = self.embedding(seq)

        packed = rnn_utils.pack_padded_sequence(
            embed_seq,
            sorted_lengths.data.tolist() if batch_size > 1 else length.data.tolist(),
            batch_first = True,
        )

        # hidden : num_layers x batch_size x hidden_dim
        _, hidden = self.gru(packed)
        hidden = hidden.permute(1, 0, 2).contiguous()
        hidden = hidden.view(batch_size, self.hidden_dim * self.num_layers)

        if batch_size > 1:
            _, reversed_idx = torch.sort(sorted_idx)
            hidden = hidden[reversed_idx]

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
