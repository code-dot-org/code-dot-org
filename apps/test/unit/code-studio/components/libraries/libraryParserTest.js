import parser from '@cdo/apps/code-studio/components/libraries/libraryParser';

describe('Library parser', () => {
  describe('sanitizeName', () => {
    it('removes whitespace', () => {
      let libraryName = 'Test Library\t\r\n\fName';
      expect(parser.sanitizeName(libraryName)).toBe('TestLibraryName');
    });

    it('removes non alphanumeric characters', () => {
      let libraryName = 'Test`~!Library🙃💩Name123';
      expect(parser.sanitizeName(libraryName)).toBe('TestLibraryName123');
    });
  });

  describe('suggestName', () => {
    it('capitalizes the first letter of a library', () => {
      let libraryName = 'testLibrary';
      expect(parser.suggestName(libraryName)).toBe('TestLibrary');
    });

    it('prepends Lib to the beginning of a library starting with a number', () => {
      let libraryName = '123testLibrary';
      expect(parser.suggestName(libraryName)).toBe('Lib123testLibrary');
    });

    it('names an empty library "Lib"', () => {
      let libraryName = '';
      expect(parser.suggestName(libraryName)).toBe('Lib');
    });
  });

  describe('createLibraryJson', () => {
    let emptyCode = '';
    let emptyFunctions = [];
    let emptyLibraryName = 'emptyLibrary';
    let emptyDescription = '';

    it('can create an empty library', () => {
      expect(
        parser.createLibraryJson(
          emptyCode,
          emptyFunctions,
          emptyLibraryName,
          emptyDescription
        )
      ).toBe(
        JSON.stringify({
          name: emptyLibraryName,
          description: emptyDescription,
          functions: emptyFunctions,
          dropletConfig: [],
          source: emptyCode,
        })
      );
    });

    describe('will return early', () => {
      it('when no library name is passed', () => {
        expect(
          parser.createLibraryJson(
            emptyCode,
            emptyFunctions,
            undefined,
            emptyDescription
          )
        ).toBeUndefined();
      });

      it('when the library name is empty', () => {
        expect(
          parser.createLibraryJson(
            emptyCode,
            emptyFunctions,
            '',
            emptyDescription
          )
        ).toBeUndefined();
      });

      it('when no code is passed', () => {
        expect(
          parser.createLibraryJson(
            undefined,
            emptyFunctions,
            emptyLibraryName,
            emptyDescription
          )
        ).toBeUndefined();
      });

      it('when functions are not passed as an array', () => {
        expect(
          parser.createLibraryJson(
            emptyCode,
            '',
            emptyLibraryName,
            emptyDescription
          )
        ).toBeUndefined();
      });

      it("when a function doesn't have a name", () => {
        let selectedFunctions = [{functionName: 'name'}, {foo: 'bar'}];
        expect(
          parser.createLibraryJson(
            emptyCode,
            selectedFunctions,
            emptyLibraryName,
            emptyDescription
          )
        ).toBeUndefined();
      });

      it('when no description is passed', () => {
        expect(
          parser.createLibraryJson(
            emptyCode,
            emptyFunctions,
            emptyLibraryName,
            undefined
          )
        ).toBeUndefined();
      });
    });

    it('is able to parse functions with comments', () => {
      let functionName = 'func';
      let comment = 'comment';
      let category = 'Functions';
      let selectedFunctions = [
        {
          functionName: functionName,
          comment: comment,
        },
      ];

      let expectedDropletConfig = [
        {
          func: functionName,
          category: category,
          comment: comment,
          type: 'either',
        },
      ];

      expect(
        parser.createLibraryJson(
          emptyCode,
          selectedFunctions,
          emptyLibraryName,
          emptyDescription
        )
      ).toEqual(
        JSON.stringify({
          name: emptyLibraryName,
          description: emptyDescription,
          functions: [functionName],
          dropletConfig: expectedDropletConfig,
          source: emptyCode,
        })
      );
    });

    it('is able to parse functions with parameters', () => {
      let functions = ['first', 'second'];
      let params = ['foo', 'bar'];
      let category = 'Functions';
      let selectedFunctions = [
        {
          functionName: functions[0],
          parameters: params,
        },
        {
          functionName: functions[1],
        },
      ];

      let expectedDropletConfig = [
        {
          func: functions[0],
          category: category,
          type: 'either',
          params: params,
          paletteParams: params,
        },
        {
          func: functions[1],
          category: category,
          type: 'either',
        },
      ];

      expect(
        parser.createLibraryJson(
          emptyCode,
          selectedFunctions,
          emptyLibraryName,
          emptyDescription
        )
      ).toEqual(
        JSON.stringify({
          name: emptyLibraryName,
          description: emptyDescription,
          functions: functions,
          dropletConfig: expectedDropletConfig,
          source: emptyCode,
        })
      );
    });
  });

  describe('prepareLibraryForImport', () => {
    let emptyCode = '';
    let channelId = '123';
    let versionId = '456';
    let emptyLibraryName = 'emptyLibrary';

    it('given a new name, renames the library', () => {
      let funcName1 = 'one';
      let funcName2 = 'two';
      let originalJson = JSON.stringify({
        name: emptyLibraryName,
        dropletConfig: [{func: funcName1}, {func: funcName2}],
        source: emptyCode,
      });

      let newName = 'newName';
      let newJson = parser.prepareLibraryForImport(
        originalJson,
        channelId,
        versionId,
        newName
      );
      expect(newJson).toEqual({
        name: newName,
        originalName: emptyLibraryName,
        channelId: channelId,
        dropletConfig: [
          {func: `${newName}.${funcName1}`},
          {func: `${newName}.${funcName2}`},
        ],
        versionId: versionId,
        source: emptyCode,
      });
    });
  });

  describe('createLibraryClosure', () => {
    let emptyLibraryName = 'emptyLibrary';
    let emptyFunctions = [];

    function closureCreator(libraryName = '', code = '', functions = '') {
      return `var ${libraryName} = (function() {${code};\nreturn {${functions}}})();`;
    }

    it('is able to parse code with quotes', () => {
      let code = '`"\'';
      let originalJson = {
        name: emptyLibraryName,
        functions: emptyFunctions,
        source: code,
      };
      let newJson = parser.createLibraryClosure(originalJson);
      expect(newJson).toEqual(closureCreator(emptyLibraryName, code));
    });

    // This is especially important when the user code ends with a comment
    it('adds a newline to the end of the user code', () => {
      let code = '// comment';
      let originalJson = {
        name: emptyLibraryName,
        functions: emptyFunctions,
        source: code,
      };
      let newJson = parser.createLibraryClosure(originalJson);
      expect(newJson).toContain('// comment;\nreturn');
    });

    it('is able to parse functions', () => {
      let code = '';
      let firstFunction = 'first';
      let secondFunction = 'second';
      let originalJson = {
        name: emptyLibraryName,
        functions: [firstFunction, secondFunction],
        source: code,
      };
      let closureFunctions = `${firstFunction}: ${firstFunction},${secondFunction}: ${secondFunction}`;
      let newJson = parser.createLibraryClosure(originalJson);
      expect(newJson).toBe(
        closureCreator(emptyLibraryName, code, closureFunctions)
      );
    });
  });
});
