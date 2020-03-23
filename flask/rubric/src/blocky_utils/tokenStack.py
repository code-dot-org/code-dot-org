class TokenStack:
    
    def __init__(self, tokens):
        self.tokens = tokens
        self.tokens.reverse()

    def __str__(self):
        return str(self.tokens)

    def isEmpty(self):
        return len(self.tokens) == 0

    def next(self):
        return self.tokens.pop()

    def peek(self):
        return self.tokens[-1]

    def checkNext(self, token):
        top = self.tokens.pop()
        if top != token:
            raise Exception('Expected ' + token + '. Got ' + top)
