import os
import sys
import json
import pickle
import numpy as np
import pandas as pd
from tqdm import tqdm

import xml.etree.ElementTree as et

CUR_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(CUR_DIR, 'data')

def xmlToAst(tree):
    elementTree = et.fromstring(tree)
    return process(elementTree, 0)

def process(xmlTree, depth):
    
    treeType = getTreeType(xmlTree)
    treeId = getTreeId(xmlTree)
    if treeType == 'next': return None

    #print out node
    newTree = Tree(treeType, treeId)

    # recurse
    for child in xmlTree:
        # Because code.org xml uses a strange "next" convention
        # I needed special code to unroll out the tail end next tags
        flattened = unrollNext(child)
        for node in flattened:
            newChild = process(node, depth + 1)
            if newChild != None:
                newTree.addChild(newChild)
    return newTree

def printName(depth, treeType):
    whiteSpace = ''
    for i in range(depth):
        whiteSpace += '  '
    print(whiteSpace + treeType)

def getTreeId(tree):
    if tree.tag == 'block':
        return tree.get('blockid')
    else:
        return -1

def getTreeType(tree):
    if tree.tag == 'xml':
        return 'Program'
    if tree.tag == 'next':
        return 'next'

    if tree.tag == 'mutation':
        return 'next'

    if tree.tag == 'block':
        return tree.get('type')
    if tree.tag == 'title':
        return tree.text
    if tree.tag == 'value':
        return 'Value'
    if tree.tag == 'statement':
        return tree.get('name')

    raise Exception('unhandled type: ' + tree.tag)

def unrollNext(tree):
    trees = []
    trees.append(tree)
    nextNode = getNextChild(tree)
    while nextNode != None:
        nextChildren = nextNode.getchildren()
        if len(nextChildren) != 1:
            raise Exception("I assume all next nodes have one child")
        curr = nextChildren[0]
        trees.append(curr)
        nextNode = getNextChild(curr)
    return trees

def getNextChild(tree):
    for child in tree:
        if child.tag == 'next':
            return child
    return None

class Tree:
    def __init__(self, rootName, rootId):
        self.rootName = rootName
        self.rootId = rootId
        self.children = []

    def addChild(self, child):
        self.children.append(child)

    def addChildAt(self, child, index):
        self.children.insert(index, child)
        
    def __str__(self):
        return self.toString(0)

    def __hash__(self):
        return hash(str(self))

    def __eq__(self, other):
        return str(self) == str(other)

    def getRoot(self):
        return f'{self.rootName}'

    def toString(self, indent):
        s = ''
        for i in range(indent):
            s += '  '
        s += self.getRoot() + '\n'
        for child in self.children:
            if child:
                s += child.toString(indent+1)
        return s

    def toTrainableInput(self):
        # format for ML training
        flat = ['(', self.getRoot()]
        for child in self.children:
            if child:
                flat += child.toTrainableInput()
        flat.append(')')
        return flat

if __name__ == "__main__":
    PRETTY = True

    data_file = os.path.join(
        DATA_DIR,
        'coursed_stage_9_2019.tsv',
    )

    data_df = pd.read_csv(
        data_file,
        sep='\t',
        error_bad_lines=False,
        header=None,
    )
    level_ids = np.asarray(data_df[1])
    xmls = np.asarray(data_df[6])

    # 14771 = problem 1
    for level in [14771]:
        xmls_level = xmls[level_ids == level]
        print(f'Processing level {level}: {len(xmls_level)} programs')
        out = os.path.join(DATA_DIR, 'processed', 'xml', f'level{level}.npy')
        np.save(out, xmls_level)

        codes = []
        bad_count = 0
        pbar = tqdm(total=len(xmls_level))
        for xml in xmls_level:
            # remove comments
            xml = xml.replace('[COMMENT REMOVED]', '')
            try:
                ast = xmlToAst(xml)
                if PRETTY:
                    code = ast.toString(0)
                else:
                    code = ' '.join(ast.toTrainableInput())
                codes.append(code.strip())
                pbar.update()
            except:
                bad_count += 1
                print(f'Bad count: {bad_count} | Can\'t parse: {xml}')
                pbar.update()
        pbar.close()

        print('Casting to array.')
        codes = np.array(codes)
        print('Saving to numpy.')
        if PRETTY:
            out = os.path.join(DATA_DIR, 'processed', 'ast', f'pretty_level{level}.json')
            json.dump(out, open(out, 'w'))
        else:
            out = os.path.join(DATA_DIR, 'processed', 'ast', f'level{level}.npy')
            np.save(out, codes)
