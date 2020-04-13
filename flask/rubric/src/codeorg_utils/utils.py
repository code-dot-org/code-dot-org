def build_repeat(n, codeInject):
    if len(codeInject) == 0:
        return 'Repeat({n}) [ ]'.format(n=n)
    else:
        return 'Repeat({n}) [ {codeInject} ]'.format(n=n, codeInject=codeInject)
    # if len(codeInject) == 0:
    #     return '''
    #     controls_repeat {{
    #         {n}
    #         DO
    #     }}
    #     '''.format(n=n)
    # else:
    #     return = '''
    #     controls_repeat {{
    #         {n}
    #         DO
    #         {codeInject}
    #     }}
    #     '''.format(n=n, codeInject=codeInject)


def build_move(forward=True):
    moveText = 'moveForward' \
        if forward else 'moveBackward'
    return moveText + '()'
    # return '''
    # maze_move {{
    #     {moveText}
    # }}
    # '''.format(moveText=moveText)


def build_nectar():
    # return 'maze_nectar'
    return 'getNectar()'


def collapse_commands(cmd_list):
    return ' '.join(cmd_list)


def isMove(token):
    if token == 'moveForward()':
        return True
    elif token == 'moveBackward()':
        return True
    return False


def isMoveForward(token):
    return token == 'moveForward()':


def isMoveBackward(token):
    return token == 'moveBackward()':


def isNectar(token):
    return token == 'getNectar()'


def isRepeat(token):
    return 'Repeat' in token


def toCodeString(codeTokens):
    return ' '.join([tok[0] for tok in codeTokens])


def toCodeList(code):
    """
    It is not easy to dropout lines or blocks when
    the code is in raw strings. Let us instead encode
    them as a list of tokens with depths.
    """
    tokens = code.split()
    depth = 0
    codeTokens = []

    for tok in tokens:
        if tok == '[':
            # -1 = meaningless depth
            codeTokens.append((tok, -1))
            depth += 1
        elif tok == ']':
            codeTokens.append((tok, -1))
            depth -= 1
        else:
            codeTokens.append((tok, depth))

    return codeTokens


def formatOutputFromTokens(codeTokens):
    """
    Convert our simplified code to output code.
    """
    codeOutputs = []

    for i, (token, depth) in enumerate(codeTokens):
        if isMoveForward(token):
            output = 'maze_move [ moveForward ]'
            codeOutputs.append(output)
        elif isMoveBackward(token):
            output = 'maze_move [ moveBackward ]'
            codeOutputs.append(output)
        elif isNectar(token):
            output = 'maze_nectar'
            codeOutputs.append(output)
        elif isRepeat(token):
            ix = token.index('(')
            jx = token.index(')')
            numLoop = int(token[ix+1:jx])

            # try to find the end of this repeat
            chosen_j = -1
            for j in range(i+1, len(codeTokens)):
                token2, depth2 = codeTokens[j]
                if depth2 == -1 and token2 == ']':
                    if j == len(codeTokens) - 1:
                        chosen_j = j
                    else:
                        token3, depth3 = codeTokens[j+1]
                        if depth3 > depth: # we are exiting the loop
                            chosen_j = j

            subOutput = formatOutputFromTokens(codeTokens[i:chosen_j+1])
            output = f'controls_repeat [ {numLoop}\nDO [ {subOutput} ] ]'

    return ' '.join(codeOutputs)
