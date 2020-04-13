def build_repeat(n, codeInject):
    if len(codeInject) == 0:
        return '''
        controls_repeat {{
            {n}
            DO
        }}
        '''.format(n=n)
    else:
        return = '''
        controls_repeat {{
            {n}
            DO
            {codeInject}
        }}
        '''.format(n=n, codeInject=codeInject)


def build_move(forward=True):
    moveText = 'moveForward' \
        if forward else 'moveBackward'
    return '''
    maze_move {{
        {moveText}
    }}
    '''.format(moveText=moveText)


def build_nectar():
    return 'maze_nectar'
