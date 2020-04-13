import copy
import numpy as np
from src.rubric_utils.decision import Decision, ReusableDecision
from src.codeorg_utils.utils import (
    collapse_commands,
    isMove,
    isNectar,
    isRepeat,
    toCodeString,
    toCodeList,
)


class Root(Decision):

    def registerChoices(self):
        self.addChoice('root_isEmpty', {
            'True': 0.05,
            'False': 0.95,
        })

        # no dropping at all
        self.addChoice('postprocess_noDrop', {
            'True': 0.8,
            'False': 0.2,
        })
        self.addChoice('postprocess_noSwap', {
            'True': 0.8,
            'False': 0.2,
        })

        # coin flip prob for every line
        self.postprocess_dropProb = 0.05
        self.postprocess_swapProb = 0.05

        self.addChoice('postprocess_dropStyle', {
            'line': 0,
            # I think most students stop instead of forgetting lines?
            'block': 1,  
        })

    def updateRubric(self):
        if eval(self.getChoice('root_isEmpty')):
            self.turnOnRubric('error:empty')

        if eval(self.getChoice('postprocess_noDrop')):
            self.turnOnRubric('error:drop-code')

        if eval(self.getChoice('postprocess_noSwap')):
            self.turnOnRubric('error:swap-move-nectar')

    def render(self):
        if eval(self.getChoice('root_isEmpty')):
            code = ''
        else:
            code = self.expand('Solution')
        '''
        ======================
        Post-processing steps:
        ======================

        1) drop random lines
          a) drop single line OR
          b) drop all lines after point

        2) Swap Move/getNectar statements
        '''
        noDrop = eval(self.getChoice('postprocess_noDrop'))
        noSwap = eval(self.getChoice('postprocess_noSwap'))

        codeTokens = toCodeList(code)

        if not noSwap:
            codeTokens = swapMoveNectar(codeTokens, prob=self.postprocess_swapProb)

        if not noDrop:
            dropStyle = self.getChoice('postprocess_dropStyle')
            if dropStyle == 'line':
                codeTokens = dropLines(codeTokens, prob=self.postprocess_dropProb)
            elif dropStyle == 'block':
                codeTokens = dropBlock(codeTokens, prob=self.postprocess_dropProb)
            else: 
                raise Exception(f'Drop style {dropStyle} not supported.')

        code = toCodeString(codeTokens)

        return code


def dropLines(codeTokens, prob=0.1):
    # choose whether to delete each move/nectar
    # token independently.
    newCodeTokens = []
    for token, depth in codeTokens:
        if isMove(token) or isNectar(token):
            if flipCoin(1 - prob):
                newCodeTokens.append((token, depth))
    return newCodeTokens


def dropBlock(codeTokens, prob=0.5):
    """
    We delete everything of the SAME depth after a 
    randomly chosen line.
    """
    chosen_i = -1
    for i, _ in enumerate(codeTokens):
        if i > 0 and flipCoin(prob):
            chosen_i = i
            break

    if chosen_i == -1:
        return codeTokens

    chosen_tok, chosen_depth = codeTokens[chosen_i]
    if isMove(chosen_tok) or isNectar(chosen_tok) or isRepeat(chosen_tok):
        for j, (_, dep) in enumerate(codeTokens[chosen_i:]):
            # NOTE: deletes any token with equal and more depth
            #       so if we enter a REPEAT, we will still delete
            # NOTE: if we already INSIDE a repeat once we quit it
            #       and the depth drops down 1, we stop.
            
            # always quit deleting when exiting loop
            if dep == -1 or dep < chosen_depth:
                break

        codeTokens = codeTokens[:chosen_i] + codeTokens[chosen_i+j+1:]

    return codeTokens


def swapMoveNectar(codeTokens, prob=0.5):
    newCodeTokens = copy.deepcopy(codeTokens)
    indices_to_swap = []
    for i, (tok1, dep1) in enumerate(newCodeTokens[:-1]):
        tok2, dep2 = newCodeTokens[i+1]
        if isMove(tok1) and isNectar(tok2) and (dep1 == dep2):
            if flipCoin(prob):
                indices_to_swap.append((i, i+1))

    for (i, j) in indices_to_swap:
        # apparently this notation works for python
        newCodeTokens[i], newCodeTokens[j] = newCodeTokens[j], newCodeTokens[i]

    return newCodeTokens


def flipCoin(prob):
    return np.random.uniform() < prob
