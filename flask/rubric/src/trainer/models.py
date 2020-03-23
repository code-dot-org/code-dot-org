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
    
    def __init__(self, vocab_size, num_labels):
        super().__init__()
        # TODO: add modules!
        # These modules define trainable parameters. Put things here like
        #   nn.Linear, nn.RNN, nn.Embedding

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
        raise NotImplementedError  #TODO: add more!
