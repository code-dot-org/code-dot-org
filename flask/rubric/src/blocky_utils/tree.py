class Tree:
    
    def __init__(self, rootName):
        self.rootName = rootName
        self.children = []

    def __str__(self):
        return self._toString(0)

    def __hash__(self):
        return hash(str(self))

    def __eq__(self, other):
        return str(self) == str(other)

    def addChild(self, child):
        self.children.append(child)
        return child

    def addChildAt(self, child, index):
        self.children.insert(index, child)
        return child

    def getChildren(self):
        return self.children

    def preorder(self):
        nodes = []
        self._preorder(nodes)
        return nodes

    def isLeaf(self):
        return len(self.children) == 0

    def _preorder(self, nodes):
        nodes.append(self)
        for child in self.children:
            child._preorder(nodes)
    

    def _toString(self, indent):
        s = ''
        for i in range(indent):
            s += '  '
        
        s += self.rootName
        s += '\n' 
        for child in self.children:
            if child:
                s += child._toString(indent+1)
        return s

    def toIdString(self):
        return self._toIdString(0)
        
    def _toIdString(self, indent):
        s = ''
        for i in range(indent):
            s += '  '
        
        s += self.rootName
        s += ' (' + str(id(self)) + ')'
        s += '\n' 
        for child in self.children:
            if child:
                s += child._toIdString(indent+1)
        return s

    def addNodeIds(self):
        self._addNodeIds(0)

    def _addNodeIds(self, nextId):
        self.id = nextId
        nextId += 1
        for child in self.children:
            nextId = child._addNodeIds(nextId)
        return nextId


    def getParent(self, node):
        # Note: I use the "is" keyword so that 
        # getParent is based on pointer equality,
        # not tree equality
        for child in self.children:
            if child is node: return self
            parent = child.getParent(node)
            if parent != None:
                return parent

        return None

    def getChildIndex(self, node):
        # I don't use the standard index method because
        # I want pointer equality
        for i in range(len(self.children)):
            if self.children[i] is node: return i
        return -1

    def removeChild(self, node):
        # I don't use the standard remove method because
        # I want pointer equality
        for i in range(len(self.children)):
            if self.children[i] is node: 
                del self.children[i]
                return
