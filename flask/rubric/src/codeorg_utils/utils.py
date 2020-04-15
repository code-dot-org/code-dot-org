def build_repeat(n, codeInject):
    if len(codeInject) == 0:
        return 'Repeat ( {n} )  [ ]'.format(n=n)
    else:
        return 'Repeat ( {n} ) [ {codeInject} ]'.format(n=n, codeInject=codeInject)
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
    return 'getNectar'


def collapse_commands(cmd_list):
    return ' '.join(cmd_list)


def isMove(token):
    if token == 'moveForward':
        return True
    elif token == 'moveBackward':
        return True
    return False


def isMoveForward(token):
    return token == 'moveForward'


def isMoveBackward(token):
    return token == 'moveBackward'


def isNectar(token):
    return token == 'getNectar'


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


def formatTokensFromOutput(output):
    """
    inverse of formatOutputFromTokens
    """
    tokens = output.split('\n')

    in_loop = 0
    old_depth, depth = -1, -1
    new_tokens = []
    for token in tokens:

        if token.strip() in ['Program', 'when_run']:
            continue

        elif token.strip() == 'maze_move':
            continue

        elif token.strip() == 'moveForward':
            old_depth = depth
            depth = token.count(' ') - 4

            if old_depth > depth:
                new_tokens.append(('}', -1))
                in_loop -= 1

            new_tokens.append(('moveForward', depth))

        elif token.strip() == 'moveBackward':
            old_depth = depth
            depth = token.count(' ') - 4

            if old_depth > depth:
                new_tokens.append(('}', -1))
                in_loop -= 1

            new_tokens.append(('moveBackward', depth))

        elif token.strip() == 'maze_nectar':
            old_depth = depth
            depth = token.count(' ') - 2

            if old_depth > depth:
                new_tokens.append(('}', -1))
                in_loop -= 1

            new_tokens.append(('getNectar', depth))

        elif token.strip() == 'DO':
            new_tokens.append(('{', -1))
            in_loop += 1

        elif token.strip().isnumeric():
            loop_num = int(token.strip())
            old_depth = depth
            depth = token.count(' ') - 4

            new_tokens.append(('(', -1))
            new_tokens.append((str(loop_num), depth))
            new_tokens.append((')', -1))

        elif token.strip() == 'controls_repeat':
            old_depth = depth
            depth = token.count(' ') - 2
            new_tokens.append(('Repeat', depth))

    for _ in range(in_loop):
        new_tokens.append(('}', -1))

    return new_tokens



def formatOutputFromTokens(codeTokens, init_depth=0):
    """
    Convert our simplified code to output code.
    """
    codeOutputs = []

    for i, (token, depth) in enumerate(codeTokens):
        if isMoveForward(token):
            output = '\t'*init_depth + 'maze_move\n' + '\t'*init_depth + '\tmoveForward\n'
            codeOutputs.append(output)
        elif isMoveBackward(token):
            output = '\t'*init_depth + 'maze_move\n' + '\t'*init_depth + '\tmoveBackward\n'
            codeOutputs.append(output)
        elif isNectar(token):
            output = '\t'*init_depth + 'maze_nectar\n'
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
            if i+2 == chosen_j:
                output = '\t'*init_depth + f'controls_repeat\n' + '\t'*init_depth + f'\t{numLoop}\n' + '\t'*init_depth + '\tDO\n'
            else:
                subOutput = formatOutputFromTokens(
                    codeTokens[i+2:chosen_j],
                    init_depth=init_depth+1,
                )
                output = '\t'*init_depth + f'controls_repeat\n' + '\t'*init_depth + f'\t{numLoop}\n' + '\t'*init_depth + '\tDO\n' + subOutput
            codeOutputs.append(output)

    return ''.join(codeOutputs)
