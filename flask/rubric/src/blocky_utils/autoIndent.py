def autoIndent(codeStr):
    lines = codeStr.split('\n')
    newCodeStr = ''
    indentLevel = 0
    for line in lines:
        cleanLine = line.strip()
        if cleanLine == '':continue
        if cleanLine[0] == '}':
            indentLevel -= 1
        indentSpace = _makeIndentSpace(indentLevel)
        newLine = indentSpace + cleanLine
        newCodeStr += newLine + '\n'
        if cleanLine[-1] == '{':
            indentLevel += 1
    return newCodeStr.strip()


def _makeIndentSpace(level):
    return '  ' * level