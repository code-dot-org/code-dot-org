def flatten_tree(tree):
    flat = ['(', tree.rootName]
    for child in tree.children:
        if child:
            flat += flatten_tree(child)
    flat.append(')')
    
    return flat


def removeColors(tree):
    for child in tree.children:
        removeColors(child)

    newChildren = []
    for child in tree.children:
        if child.rootName != 'SetColor':
            newChildren.append(child)

    tree.children = newChildren
