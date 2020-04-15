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
