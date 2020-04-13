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


def isNectar(token):
    return token == 'getNectar()'


def isRepeat(token):
    return 'Repeat' in token
