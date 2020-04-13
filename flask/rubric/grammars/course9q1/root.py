import numpy as np
from src.rubric_utils.decision import Decision
from src.codeorg_utils.utils import collapse_commands


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
        self.addChoice('postprocess_noGlue', {
            'True': 0.8,
            'False': 0.2,
        })

        # coin flip prob for every line
        self.postprocess_dropProb = 0.2 
        self.postprocess_swapProb = 0.2

        self.addChoice('postprocess_dropStyle', {
            'line': 0.5,
            'block': 0.5
        })

    def updateRubric(self):
        if eval(self.getChoice('root_isEmpty')):
            self.turnOnRubric('error:empty')

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

        3) Glue programs together!
        '''

        noDrop = eval(self.getChoice('postprocess_noDrop'))
        noSwap = eval(self.getChoice('postprocess_noSwap'))
        noGlue = eval(self.getChoice('postprocess_noGlue'))

        if not noDrop:
            dropStyle = self.getChoice('postprocess_dropStyle')
            if dropStyle == 'line':
                code = dropLines(code, prob=self.postprocess_dropProb)
            elif dropStyle == 'block':
                code = dropBlock(code, prob=self.postprocess_dropProb)
            else: 
                raise Exception(f'Drop style {dropStyle} not supported.')

        if not noSwap:
            code = swapMoveNectar(code, prob=self.postprocess_swapProb)
        
        # INFINITE recursion because cant resample self..
        # if not noGlue:
            # newRoot = self.expand('Root')
            # code = collapse_commands([code, newRoot])

        return code


def dropLines(code, prob=0.5):
    return code


def dropBlock(code, prob=0.5):
    return code


def swapMoveNectar(code, prob=0.5):
    return code


def flipCoin(prob):
    return np.random.uniform() < prob
