def build_repeat(n, codeInject):
    return '''
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