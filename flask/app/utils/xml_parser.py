import xml.etree.ElementTree as et
from .tree import Tree

"""
Method: Xml To Ast
------------------
This method takes in raw code.org xml (that represents a student) program
and directly translates it into a tree. Two important pieces happen:
1. Code.org uses a funny tail end "next" representation, which gets
   changed into a traditional AST format
2. We chose reasonable node names based on xml tags. Sometimes these come
   from the xml tag. Sometimes they come from other attributes. 
"""

def xmlToAst(tree):
    elementTree = et.fromstring(tree)
    return process(elementTree, 0)

#-------------------------------------------------------------------#
#       Private Helper Methods
#-------------------------------------------------------------------#

def process(xmlTree, depth):
    
    treeType = getTreeType(xmlTree)
    if treeType == 'next': return None

    #print out node
    newTree = Tree(treeType)

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