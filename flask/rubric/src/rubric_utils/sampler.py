import os
import re
import sys
import glob
import copy
import random
import inspect
import numpy as np
from string import Formatter
from collections import deque, defaultdict
from os.path import dirname, basename, isfile

import src.rubric_utils.generatorUtils as gu


class Sampler:

    _nonterminalCache = None

    def __init__(self, grammar_dir):
        self._reset()
        self._nonterminals, self._reusableNonterminals = self._getNonTerminals(grammar_dir)

    def sample(self, n = 1):
        # return n random samples from the grammar.
        # each sample is a dictionary with text, choices and
        # the rubric items that were turned on
        samples = []
        for i in range(n):
            sample = self.singleSample()
            samples.append(sample)
        return samples

    def singleSample(self):
        # Generate a single sample from the grammar
        self._reset()
        self._isRenderingChoices = True
        sampleText = self._render('Start')
        self._isRenderingChoices = False
        rubricItems = self.rubric
        choices = self.choices
        sample = {
            'text':sampleText, 
            'rubric':rubricItems, 
            'choices':choices
        }
        return sample

    ################################################
    # The rest of this class is private. Read only if
    # you are curious how it is implemented. You 
    # shouldn't need to read any further to use ideaToText
    #################################################

    def _addGlobalChoice(self, choice_name, val):
        if choice_name in self.choices:
            raise ValueError('Key [{}] already in global choices'.format(choice_name))

        self.choices[choice_name] = val

    def _reset(self):
        self.state = {}
        self.choices = {}
        self.rubric = {}

    def _pick_rv(self, choice_name, values):
        if type(values) is list:
            # reduce uniform case to dictionary case
            values = {val: 1 for val in values}

        tuples = [(v, p) for v, p in values.items()]
        # unpack list of pairs to pair of lists
        choices, ps = list(zip(*tuples))
        ps /= np.sum(ps)

        # operate on indices so numpy doesnt do weird typecasts
        choice_idx = np.random.choice(range(len(choices)), p=ps)
        return choices[choice_idx]

    def _compileRegisteredIds(self, nonterminals, reusableNonterminals):
        '''
         This method should loop through all decisions and get their preregistered ids.
         This will give us an overview of how each reusable decision is intended to be used.
         
         We group these registered ids by the ReusableDecision they are relevatn to and
         return a dictionary from ReusableDecision name to set of valid ids for that decision.
        '''
        # we keep track of the reusable non terminals
        
        allRegisteredIds = defaultdict(list)
        for nonterminal in nonterminals.values():
            baseClass = str(nonterminal.__class__.__base__)
            if baseClass.endswith('ReusableDecision'):
                registeredIds = nonterminal.preregisterDecisionIds()
                if registeredIds is None:   # no ids registered
                    continue

                for reusable_decision, valid_ids in registeredIds.items():
                    allRegisteredIds[reusable_decision].extend(list(valid_ids))
       
        registeredButNotReusable = set(allRegisteredIds.keys()) - reusableNonterminals
        reusableButNotRegistered = reusableNonterminals - set(allRegisteredIds.keys())
        # make sure evely registeredId corresponds to a reusable decision.
        if registeredButNotReusable:
            raise ValueError(f'Invalid registration of non-reusable decisions {registeredButNotReusable}')
        
        # print warnings for reusable decisions that dont have valid ids registered?
        if reusableButNotRegistered:
            print(f'WARNING: reusable decisions not registered anywhere: {reusableButNotRegistered}')
            input('Press enter to continue: ')

        return allRegisteredIds

        # TODO: make it so that any runtime registerChoices is not dynamic---throw error if. Like rubric pipeline

    def _setReusableDecisionIds(self, nonterminals, reusableNonterminals):
        registeredIds  = self._compileRegisteredIds(nonterminals, reusableNonterminals)
        for reusable in reusableNonterminals:
            validIds = registeredIds[reusable]
            nonterminals[reusable].registerValidIds(validIds)

    def _getNonTerminals(self, grammar_dir):
        nonterminals, reusableNonterminals = self._loadNonTerminals(grammar_dir)
        self._setResusableDecisionIds(nonterminals, reusableNonterminals)   # modifies params in place
        return nonterminals, reusableNonterminals

    def _loadNonTerminals(self, grammar_dir):
        # if Engine._nonterminalCache != None:
        #   return Engine._nonterminalCache
        nonterminals = {}
        reusableNonterminals = set()
        file_paths = glob.glob(os.path.join(grammar_dir, "*.py"))
        files = [ f[:-3].replace(os.path.sep, '.') for f in file_paths if isfile(f) and not f.endswith('__init__.py')]
        for f in files:
            module = __import__(f, fromlist=['object'])
            for obj in  dir(module):
                if not obj.startswith('__'):
                    clazz = module.__getattribute__(obj)
                    # TODO: fix hacky conditions
                    
                    if inspect.isclass(clazz) and clazz.__base__.__name__.endswith('Decision') and not clazz.__name__ == 'ReusableDecision':
                        name = clazz.__name__
                        if clazz.__base__.__name__ == 'ReusableDecision':
                            reusableNonterminals.add(name)                        

                        if name in nonterminals:
                            raise ValueError('Repeated name for nonterminal: {}'.format(name))
                        nonterminals[name] =  clazz(self)
        Sampler._nonterminalCache = nonterminals
        return nonterminals, reusableNonterminals

    def _symbol_from_key(self, format_key):
        match = re.search(r'([A-Za-z]+)(_\d)?', format_key)
        return match.group(1)

    def _render(self, nonterminal, params = {}):
        curr = self._nonterminals[nonterminal]
        curr._setParams(params)

        curr._incrementCount()
        curr.registerChoices()
        curr.updateRubric()
        
        render = curr.render()
        render = gu.fixWhitespace(render)

        to_generate = [t[1] for t in Formatter().parse(render) if t[1] is not None]

        formatter = dict()
        for format_key in to_generate:
            try:
                symbol_to_gen = self._symbol_from_key(format_key)
            except:
                import pdb; pdb.set_trace()
            formatter[format_key] = self._render(symbol_to_gen)
        curr._setParams({}) # clear params

        return render.format(**formatter)