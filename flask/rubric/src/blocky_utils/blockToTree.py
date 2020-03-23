import src.blocky_utils.tokenParser
from src.blocky_utils.tree import Tree


def convert(code):
    codeNoComments = removeComments(code)
    tokenStack = tokenParser.parse(codeNoComments)
    root = Tree('Program')
    root.addChild(Tree('WhenRun'))
    while not tokenStack.isEmpty():
        root.addChild(getBlock(tokenStack))
    return root


def removeComments(code):
    newCode = ''
    for line in code.split('\n'):
        if len(line) > 0 and line[0] != '#':
            newCode += line + '\n'
    return newCode


def getBlock(tokenStack):
    nextToken = tokenStack.peek()
    if nextToken == 'Repeat':
        return getRepeat(tokenStack)
    elif isCommand(nextToken):
        return getInvocation(tokenStack)
    elif nextToken == 'For':
        return getFor(tokenStack)
    else:
        raise Exception('unhandled token: ' + nextToken)


def getInvocation(tokenStack):
    codeCmd = tokenStack.next()
    cmd, param1 = parseCommandName(codeCmd)
    tokenStack.checkNext('(')
    param2 = getExpression(tokenStack)
    tokenStack.checkNext(')')
    tree = Tree(cmd)
    tree.addChild(Tree(param1))
    tree.addChild(param2)
    return tree


def getExpression(tokenStack):
    lhs = getUnary(tokenStack)

    # If you don't find a binary opp next,
    # you are done
    if not isBinaryOpperator(tokenStack.peek()): 
        return lhs
    opp = tokenStack.next()
    oppName = getOppName(opp)
    rhs = getUnary(tokenStack)
    oppTree = Tree('Arithmetic')
    oppTree.addChild(Tree(oppName))
    oppTree.addChild(lhs)
    oppTree.addChild(rhs)
    return oppTree


def getUnary(tokenStack):
    if tokenStack.peek() != '(':
        unary = getValue(tokenStack)
    else:
        tokenStack.checkNext('(')
        unary = getExpression(tokenStack)
        tokenStack.checkNext(')')
    return unary


def getValue(tokenStack):
    singleton = tokenStack.next()
    if isNumber(singleton):
        return makeNumberValue(singleton)
    elif singleton == 'i' or singleton == 'x':
        tree = Tree('Value')
        var = tree.addChild(Tree('Variable'))
        var.addChild(Tree('Counter'))
        return tree
    else:
        raise Exception('???: ' + singleton)


def getRepeat(tokenStack):
    tokenStack.checkNext('Repeat')
    tokenStack.checkNext('(')
    numTimes = getExpression(tokenStack)
    tokenStack.checkNext(')')
    tokenStack.checkNext('{')
    body = getBody(tokenStack)
    tokenStack.checkNext('}')

    repeatTree = Tree('Repeat')
    repeatTree.addChild(numTimes)
    repeatTree.addChild(body)
    return repeatTree


def getFor(tokenStack):
    tokenStack.checkNext('For')
    tokenStack.checkNext('(')
    start = str(getExpression(tokenStack))
    tokenStack.checkNext(',')
    end = str(getExpression(tokenStack))
    tokenStack.checkNext(',')
    delta = str(getExpression(tokenStack))
    tokenStack.checkNext(')')
    tokenStack.checkNext('{')
    body = getBody(tokenStack)
    tokenStack.checkNext('}')

    forTree = Tree('For')
    forTree.addChild(makeNumberValue(start))
    forTree.addChild(makeNumberValue(end))
    forTree.addChild(makeNumberValue(delta))
    forTree.addChild(body)
    return forTree


def makeNumberValue(numStr):
    tree = Tree('Value')
    tree.addChild(Tree('Number')).addChild(Tree(numStr))
    return tree


def getBody(tokenStack):
    body = Tree('Body')
    while True:
        nextToken = tokenStack.peek()
        if nextToken == '}':
            return body
        body.addChild(getBlock(tokenStack))


def parseCommandName(s):
    if s == 'MoveForward':
        return 'Move', 'Forward'
    if s == 'MoveBackwards':
        return 'Move', 'Backward'
    if s == 'TurnRight':
        return 'Turn', 'Right'
    if s == 'TurnLeft':
        return 'Turn', 'Left'
    raise Exception(s)


def isBinaryOpperator(s):
    opps = ['-', '*', '/', '+']
    return s in opps


def isCommand(s):
    cmds = ['MoveForward', 'TurnRight', 'TurnLeft', 'MoveBackwards']
    return s in cmds


def getOppName(s):
    oppMap = {
        '/':'Division',
        '*':'Multiplication',
        '-':'Subtraction',
        '+':'Addition'
    }
    return oppMap[s]


def isNumber(s):
    try:
        float(s)
        return True
    except ValueError:
        return False
