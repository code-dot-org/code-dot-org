r"""Train a neural network to predict feedback for a program string."""

import os
import sys
import random
import numpy as np
from tqdm import tqdm
from sklearn.metrics import f1_score

import torch
import torch.optim as optim
import torch.utils.data as data
import torch.nn.functional as F

from src.trainer.utils import AverageMeter, save_checkpoint
from src.trainer.datasets import RubricDataset, TransferDataset


def train_pipeline(model_class, train_data_path, test_data_path, config):
    device = torch.device('cpu')  # no CUDA support for now

    # reproducibility
    torch.manual_seed(config['seed'])
    np.random.seed(config['seed'])

    if not os.path.isdir(config['out_dir']):
        os.makedirs(config['out_dir'])

    # load the dataset! this might be new for you guys but usually, we wrap
    # data into Dataset classes.
    train_dataset = RubricDataset(train_data_path, vocab=None,
                                  max_seq_len=config['max_seq_len'], min_occ=config['min_occ'])
    test_dataset = RubricDataset(test_data_path, vocab=train_dataset.vocab,
                                 max_seq_len=config['max_seq_len'], min_occ=config['min_occ'])

    # We use a Loader that wraps around a Dataset class to return minibatches...
    # "shuffle" means we randomly pick rows from the full set. We only do this in training
    # because it helps us not memorize the order of inputs.
    train_loader = data.DataLoader(train_dataset, batch_size=config['batch_size'], shuffle=True)
    val_loader = data.DataLoader(val_dataset, batch_size=config['batch_size'], shuffle=False)
    test_loader = data.DataLoader(test_dataset, batch_size=config['batch_size'], shuffle=False)

    # this instantiates our model
    model = model_class(vocab_size=train_dataset.vocab_size,
                        num_labels=train_dataset.num_labels)
    model = model.to(device)
    # initialize our optimizer
    optimizer = optim.Adam(model.parameters(), lr=config['lr'], weight_decay=config['weight_decay'])


    def train(epoch):
        model.train()
        loss_meter = AverageMeter()  # utility for tracking loss / accuracy
        acc_meter = AverageMeter()

        label_arr, pred_arr = [], []
        pbar = tqdm(len(train_loader))

        for batch_idx, (token_seq, token_len, label) in enumerate(train_loader):
            batch_size = len(token_seq)
            token_seq = token_seq.to(device)  # sequence of token indexes
            token_len = token_len.to(device)  # length of a non-padded sentence
            label = label.to(device)

            label_out = model(token_seq, token_len)  # label_out is the prediction
            loss = F.binary_cross_entropy(label_out, label)  # same loss as in IRT!

            optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm(
                model.parameters(),
                config['max_grad_norm'],
            )
            optimizer.step()
            loss_meter.update(loss.item(), batch_size)

            with torch.no_grad():
                pred_npy = torch.round(label_out).detach().numpy()
                label_npy = label.detach().numpy()
                acc = np.mean(pred_npy == label_npy)
                acc_meter.update(acc, batch_size)

            label_arr.append(label_npy)
            pred_arr.append(pred_npy)

            pbar.set_postfix({'Loss': loss_meter.avg, 'Accuracy': acc_meter.avg})
            pbar.update()

        pbar.close()

        label_arr = np.vstack(label_arr).flatten()
        pred_arr = np.vstack(pred_arr).flatten()

        acc = np.mean(pred_arr == label_arr)
        # F1 score is a better measure  of performance than accuracy for datasets
        # that are biased towards 0 or 1. Closer to 1 is better!
        f1 = f1_score(label_arr, pred_arr)

        print('====> Epoch: {}\tLoss: {:.4f}\tAccuracy: {:.4f}\tF1: {:.4f}'.format(
            epoch, loss_meter.avg, acc, f1))

        return loss_meter.avg, acc, f1


    def test(epoch, loader, name='Test'):
        model.eval()
        loss_meter = AverageMeter()
        label_arr, pred_arr = [], []

        with torch.no_grad():
            with tqdm(total=len(loader)) as pbar:
                for (token_seq, token_len, label) in loader:
                    assert label is not None
                    batch_size = len(token_seq)
                    token_seq = token_seq.to(device)
                    token_len = token_len.to(device)
                    label = label.to(device)

                    label_out = model(token_seq, token_len)
                    loss = F.binary_cross_entropy(label_out, label)
                    loss_meter.update(loss.item(), batch_size)

                    pred_npy = torch.round(label_out).detach().numpy()
                    label_npy = label.detach().numpy()

                    label_arr.append(label_npy)
                    pred_arr.append(pred_npy)

                    pbar.update()

        label_arr = np.vstack(label_arr).flatten()
        pred_arr = np.vstack(pred_arr).flatten()

        acc = np.mean(pred_arr == label_arr)
        f1 = f1_score(label_arr, pred_arr)

        print('====> {} Epoch: {}\tLoss: {:.4f}\tAccuracy: {:.4f}\tF1: {:.4f}'.format(
            name, epoch, loss_meter.avg, acc, f1))

        return loss_meter.avg, acc, f1


    best_loss = np.inf
    track_train_loss = np.zeros(config['epochs'])
    track_test_loss = np.zeros(config['epochs'])
    track_train_acc = np.zeros(config['epochs'])
    track_test_acc = np.zeros(config['epochs'])
    track_train_f1 = np.zeros(config['epochs'])
    track_test_f1 = np.zeros(config['epochs'])

    for epoch in range(1, config['epochs'] + 1):
        train_loss, train_acc, train_f1 = train(epoch)
        # the test set is whats actually reported
        test_loss, test_acc, test_f1 = test(epoch, test_loader, name='Test')

        track_train_loss[epoch - 1] = train_loss
        track_test_loss[epoch - 1] = test_loss
        track_train_acc[epoch - 1] = train_acc
        track_test_acc[epoch - 1] = test_acc
        track_train_f1[epoch - 1] = train_f1
        track_test_f1[epoch - 1] = test_f1

        is_best = val_loss < best_loss
        best_loss = min(val_loss, best_loss)

        save_checkpoint({
            'state_dict': model.state_dict(),
            'optimizer_state_dict': optimizer.state_dict(),
            'config': config,
            'vocab': train_dataset.vocab,
            'vocab_size': train_dataset.vocab_size,
            'num_labels': train_dataset.num_labels,
        }, is_best, folder=config['out_dir'])

        np.save(os.path.join(config['out_dir'], 'train_loss.npy'), track_train_loss)
        np.save(os.path.join(config['out_dir'], 'test_loss.npy'), track_test_loss)
        np.save(os.path.join(config['out_dir'], 'train_acc.npy'), track_train_acc)
        np.save(os.path.join(config['out_dir'], 'test_acc.npy'), track_test_acc)
        np.save(os.path.join(config['out_dir'], 'train_f1.npy'), track_train_f1)
        np.save(os.path.join(config['out_dir'], 'test_f1.npy'), track_test_f1)


def transfer_pipeline(model_class, checkpoint_path, real_data_path):
    device = torch.device('cpu')  # no CUDA support for now

    checkpoint = torch.load(checkpoint_path)
    config = checkpoint['config']

    model = model_class(vocab_size=checkpoint['vocab_size'],
                        num_labels=checkpoint['num_labels'])
    model.load_state_dict(checkpoint['state_dict'])  # load trained model
    model = model.eval()

    # reproducibility
    torch.manual_seed(config['seed'])
    np.random.seed(config['seed'])

    real_dataset = TransferDataset(real_data_path, vocab=checkpoint['vocab'],
                                    max_seq_len=config['max_seq_len'], min_occ=config['min_occ'])
    real_loader = data.DataLoader(real_dataset, batch_size=config['batch_size'], shuffle=False)

    with torch.no_grad():
        label_arr, pred_arr = [], []

        with torch.no_grad():
            with tqdm(total=len(real_loader)) as pbar:
                for (token_seq, token_len, label) in real_loader:
                    assert label is not None
                    token_seq = token_seq.to(device)
                    token_len = token_len.to(device)
                    label = label.to(device)

                    label_out = model(token_seq, token_len)
                    pred_npy = torch.round(label_out).detach().numpy()
                    label_npy = label.detach().numpy()

                    label_arr.append(label_npy)
                    pred_arr.append(pred_npy)

                    pbar.update()

        label_arr = np.vstack(label_arr).flatten()
        pred_arr = np.vstack(pred_arr).flatten()

        acc = np.mean(pred_arr == label_arr)
        f1 = f1_score(label_arr, pred_arr)

    return {'accuracy': acc, 'f1': f1}
