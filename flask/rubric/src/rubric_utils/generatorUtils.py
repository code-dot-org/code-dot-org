from numpy.random import choice
import random


class SafeDict(dict):
    def __missing__(self, key):
        return '{' + key + '}'


def fillTemplate(template, templateVars):
    
    startTemp = '<START_BRACKET>'
    endTemp = '<END_BRACKET>'
    template = template.replace('{{', startTemp)
    template = template.replace('}}', endTemp)

    result = template.format_map(SafeDict(templateVars))

    result = result.replace(startTemp, '{{')
    result = result.replace(endTemp, '}}')
    return result


def calcGoodTuringP(countMap):
    if len(countMap) == 0: return 1.0
    n1 = 0
    for key in countMap:
        if countMap[key] == 1:
            n1 += 1
    return float(n1) / len(countMap)