import sys
import numpy as np

import torch
import torch.nn as nn
from torch.nn import functional as F
import torch.nn.utils.rnn as rnn_utils


class FeedbackNN(nn.Module):
    """
    Neural network responsible for ingesting a tokenized student 
    program, and spitting out a categorical prediction.

    We give you the following information:
        vocab_size: number of unique tokens 
        num_labels: number of output feedback labels
    """
    
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
        """
        Forward pass for your feedback prediction network.

        @param token_seq: batch_size x max_seq_length
            Example: torch.Tensor([[0,6,2,3],[0,2,5,3], ...])
            These define your PADDED programs after tokenization.
        
        @param token_length: batch_size
            Example: torch.Tensor([4,4, ...])
            These define your unpadded program lengths.

        This function should return the following:
        @param label_out: batch_size x num_labels
            Each index in this tensor represents the likelihood of predicting
            1. Unlike IRT, this is a multilabel prediction program so we need
            to have a likelihood for every feedback. NOTE: this is NOT categorical
            since we can have multiple feedback at once. 

            This will be given to F.binary_cross_entropy(...), just like IRT!
        """
        rep = self.encoder(seq, length)
        return self.decoder(rep)


class BlockyEncoder(nn.Module):
    r"""
    @param hidden_dim: integer [default: 256]
                       size of hidden layer
    @param num_layers: integer [default: 2]
                       number of hidden layers in GRU
    """
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
    r"""
    @param num_labels: integer
                      number of label dimensions
    @param hidden_dim: integer [default: 256]
                       number of hidden dimensions
    """
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
