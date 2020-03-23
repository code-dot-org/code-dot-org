# isalnum
# isalpha
# isdigit
# isspace (all whitespace)


def parse(code):
    tokens = []
    curr = ''
    for i, ch in enumerate(code):
        if str.isalnum(ch) or ch in ['.'] or (ch in ['+', '-'] and 
                                              code[i-1] != 'i' and
                                              code[i+1] != 'i'):
            curr += ch
        else:
            if curr != '':
                tokens.append(curr)
                curr = ''
            if not str.isspace(ch):
                tokens.append(ch)
    
    return TokenStack(tokens)
