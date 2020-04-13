def build_repeat(n, codeInject):
    if len(codeInject) == 0:
        return 'Repeat({n}) []'.format(n=n)
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
    return '\n'.join(cmd_list)
