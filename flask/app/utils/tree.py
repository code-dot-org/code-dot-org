class Tree:
    def __init__(self, rootName):
        self.rootName = rootName
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

    def toString(self, indent):
        s = ''
        for i in range(indent):
            s += '  '
        s += self.rootName + '\n'
        for child in self.children:
            if child:
                s += child.toString(indent+1)
        return s

    def normalize(self):
        for child in self.children:
            child.normalize()

        if self.rootName == 'Block':
            newChildren = []

            for child in self.children:
                if child.rootName == 'Block':
                    for grandchild in child.children:
                        newChildren.append(grandchild)
                else:
                    newChildren.append(child)

            self.children = newChildren

    def makeCode(self):
        return self.makeCodeRec(0)

    def makeCodeRec(self, indent):
        s = ''
        if self.rootName != 'Block':
            for i in range(indent):
                s += '  '

        if self.rootName == 'Repeat':
            s += 'Repeat '
            s += self.children[0].rootName + ':\n'
            s += self.children[1].makeCodeRec(indent + 1)

        if self.rootName == 'Block':
            for child in self.children:
                s += child.makeCodeRec(indent)

        if self.rootName == 'TurnLeft':
            s += 'TurnLeft '
            s += self.children[0].rootName + '\n'

        if self.rootName == 'TurnRight':
            s += 'TurnRight '
            s += self.children[0].rootName + '\n'

        if self.rootName == 'Move':
            s += 'Move '
            s += self.children[0].rootName + '\n'

        if self.rootName == 'Color':
            s += 'Color '
            s += self.children[0].rootName + '\n'

        return s
