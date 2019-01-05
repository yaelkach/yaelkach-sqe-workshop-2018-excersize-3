import assert from 'assert';
import {main, Prog} from '../src/js/colorJson.js';
import {Program, toStringArray} from '../src/js/code-analyzer.js';


describe('The javascript parser', () => {
    it('testing program in colorjson', () => {
        assert.deepEqual(
            Prog('let count;       \n' +
                'function loo(x,y){\n' +
                'count =0;             \n' +
                'while(count<y)             \n' +
                'count = count +1;\n' +
                '                 \n' +
                'if(x>y)\n' +
                'count = count+2;\n' +
                'else if(x<y)\n' +
                'count = count+3;\n' +
                'else\n' +
                'count = count+4;\n' +
                '\n' +
                'return z;\n' +
                '                }', '6, 4', [])[0], '<pre>\n' +
            'let count;\n' +
            '\n' +
            'function loo(x, y) {\n' +
            '\n' +
            '    count = 0;\n' +
            '\n' +
            '<span style="background-color:green;">     while (count < y) </span>\n' +
            '\n' +
            '        count = count + 1;\n' +
            '\n' +
            '<span style="background-color:green;">     if (x > y) </span>\n' +
            '\n' +
            '        count = count + 2;\n' +
            '\n' +
            '<span style="background-color:red;">     else if (x < y) </span>\n' +
            '\n' +
            '        count = count + 3;\n' +
            '\n' +
            '    else\n' +
            '\n' +
            '        count = count + 4;\n' +
            '\n' +
            '    return;\n' +
            '\n' +
            '}\n' +
            '</pre>');
    });
    it('testing program in colorjson', () => {
        assert.deepEqual(
            main('let x =4;\n' +
                'function foo(){\n' +
                'let arr = [1,2,3];\n' +
                'arr[0] = arr[1];\n' +
                'let y =5;\n' +
                'if(y<x)\n' +
                'x=x+1;\n' +
                'else if(y>x){\n' +
                'x=x+2;\n' +
                '}\n' +
                'else{\n' +
                'arr[2]=arr[0];\n' +
                '}\n' +
                '\n' +
                'while(y>0){\n' +
                'y=y-1;\n' +
                '}\n' +
                'return x;\n' +
                '}', '', []), 'let x = 4;\n' +
            'function foo() {\n' +
            '    arr[0] = 2;\n' +
            '    if (5 < x)\n' +
            '        x = x + 1;\n' +
            '    else if (5 > x) {\n' +
            '        x = x + 2;\n' +
            '    } else {\n' +
            '        arr[2] = 2;\n' +
            '    }\n' +
            '    while (5 > 0) {\n' +
            '    }\n' +
            '    return x;\n' +
            '}');
    });
    it('string vertices', () => {
        let vertices = Program('function foo(arr, y, z){\n' +
            '               let a = arr[0] + 1; \n' +
            '               let b = a + y;\n' +
            '               let c = 0;\n' +
            '            \n' +
            '             while (a < z) {\n' +
            '            arr[1] = arr[0];\n' +
            '                   c = a + b;\n' +
            '                   z = c * 2;\n' +
            '                   a=a+1;\n' +
            '               }\n' +
            '            if(y<z){\n' +
            '            y=y+1;\n' +
            '            }\n' +
            '            else if(z<y){\n' +
            '            z=z+1;\n' +
            '            }\n' +
            '               \n' +
            '               return z;\n' +
            '            }', '[5,6],2,3', ['red', 'green', 'red'])[0];
        assert.deepEqual(vertices, 'LetOrAssignmentVertex1=>operation: 1)  let a = arr[0] + 1;\n' +
            'let b = a + y;\n' +
            'let c = 0;\n' +
            '|green\n' +
            'NullVertex2=>operation:  2)  +  NULL|green\n' +
            'WhileVertex3=>condition: 3)  a < z|green\n' +
            'LetOrAssignmentVertex4=>operation: 4)  arr[1] = arr[0];\n' +
            'c = a + b;\n' +
            'z = c * 2;\n' +
            'a = a + 1;\n' +
            '\n' +
            'IfVertex5=>condition: 5)  y < z|green\n' +
            'LetOrAssignmentVertex6=>operation: 6)  y = y + 1;\n' +
            '\n' +
            'IfVertex7=>condition: 7)  z < y|green\n' +
            'LetOrAssignmentVertex8=>operation: 8)  z = z + 1;\n' +
            '\n' +
            'DummyVertex8=>end: .|green\n' +
            'ReturnVertex10=>operation: 9)  return z|green\n');
    });


    it('string vertices2', () => {
        let vertices = Program('let x = 2;\n' +
            'let a = 3;\n' +
            'function goo(y,z){\n' +
            'if(y<z){\n' +
            'x=x+1;\n' +
            '}\n' +
            'else if(3<y){\n' +
            'x=x+2;\n' +
            '}\n' +
            'else if(3<z){\n' +
            'x=x+3;\n' +
            '}\n' +
            'else{\n' +
            'y=x+2;\n' +
            'y =y+2;\n' +
            '}\n' +
            'if(a<z){\n' +
            'a= a+1;\n' +
            '}\n' +
            'return z;\n' +
            '}', ['green', 'red', 'red', 'red'])[0];
        assert.deepEqual(vertices, 'LetOrAssignmentVertex1=>operation: 1)  let x = 2;\n' +
            'let a = 3;\n' +
            '|green\n' +
            'IfVertex2=>condition: 2)  y < z|green\n' +
            'LetOrAssignmentVertex3=>operation: 3)  x = x + 1;\n' +
            '|green\n' +
            'IfVertex4=>condition: 4)  3 < y|green\n' +
            'LetOrAssignmentVertex5=>operation: 5)  x = x + 2;\n' +
            '\n' +
            'IfVertex6=>condition: 6)  3 < z\n' +
            'LetOrAssignmentVertex7=>operation: 7)  x = x + 3;\n' +
            '\n' +
            'LetOrAssignmentVertex8=>operation: 8)  y = x + 2;\n' +
            'y = y + 2;\n' +
            '\n' +
            'DummyVertex8=>end: .|green\n' +
            'IfVertex10=>condition: 9)  a < z|green\n' +
            'LetOrAssignmentVertex11=>operation: 10)  a = a + 1;\n' +
            '\n' +
            'DummyVertex11=>end: .|green\n' +
            'ReturnVertex13=>operation: 11)  return z|green\n');
    });

    it('string vertices3', () => {
        let vertices = Program('function g(x){\n' +
            'let y =2;\n' +
            'if(x<1){\n' +
            'x = x+1;\n' +
            '}\n' +
            'return x;}', ['red'])[0];
        assert.deepEqual(vertices, 'LetOrAssignmentVertex1=>operation: 1)  let y = 2;\n' +
            '|green\n' +
            'IfVertex2=>condition: 2)  x < 1|green\n' +
            'LetOrAssignmentVertex3=>operation: 3)  x = x + 1;\n' +
            '\n' +
            'DummyVertex3=>end: .|green\n' +
            'ReturnVertex5=>operation: 4)  return x|green\n');
    });

    it('string edges', () => {
        assert.deepEqual(
            Program('function foo(arr, y, z){\n' +
                '   let a = arr[0] + 1;\n' +
                '   let b = a + y;\n' +
                '   let c = 0;\n' +
                '   \n' +
                '   while (a < z) {\n' +
                'arr[1] = arr[0];\n' +
                '       c = a + b;\n' +
                '       z = c * 2;\n' +
                '       a=a+1;\n' +
                '   }\n' +
                'if(y<z){\n' +
                'y=y+1;\n' +
                '}\n' +
                'else if(z<y){\n' +
                'z=z+1;\n' +
                '}\n' +
                '   \n' +
                '   return z;\n' +
                '}\n', '[5,6],2,3', ['red', 'green', 'red'])[1], 'LetOrAssignmentVertex1->NullVertex2\n' +
            'NullVertex2->WhileVertex3\n' +
            'WhileVertex3(yes, right)->LetOrAssignmentVertex4\n' +
            'LetOrAssignmentVertex4->NullVertex2\n' +
            'WhileVertex3(no, bottom)->IfVertex5\n' +
            'IfVertex5(yes)->LetOrAssignmentVertex6\n' +
            'LetOrAssignmentVertex6->DummyVertex8\n' +
            'IfVertex5(no)->IfVertex7\n' +
            'IfVertex7(yes)->LetOrAssignmentVertex8\n' +
            'LetOrAssignmentVertex8->DummyVertex8\n' +
            'DummyVertex8->ReturnVertex10\n');
    });

    it('string edges2', () => {
        assert.deepEqual(
            Program('let arr = [1,2]\n' +
                'function goo (x){\n' +
                'if(x<1){\n' +
                'x = x-1;\n' +
                '}\n' +
                'else{\n' +
                'arr[0] = arr [1];\n' +
                '}\n' +
                'return x;\n' +
                '}', '0', ['green'])[1], 'LetOrAssignmentVertex1->IfVertex2\n' +
            'IfVertex2(yes)->LetOrAssignmentVertex3\n' +
            'LetOrAssignmentVertex3->DummyVertex4\n' +
            'IfVertex2(no)->LetOrAssignmentVertex4\n' +
            'LetOrAssignmentVertex4->DummyVertex4\n' +
            'DummyVertex4->ReturnVertex6\n');
    });
    it('string edges3 ', () => {
        assert.deepEqual(
            Program('let arr = [1,2]\n' +
                'function goo (x){\n' +
                'while(x>2){\n' +
                'arr[0] = arr[0] +1;\n' +
                'x = x -1;\n' +
                '}\n' +
                'return arr;\n' +
                '}', '0', ['red'])[1], 'LetOrAssignmentVertex1->NullVertex2\n' +
            'NullVertex2->WhileVertex3\n' +
            'WhileVertex3(yes, right)->LetOrAssignmentVertex4\n' +
            'LetOrAssignmentVertex4->NullVertex2\n' +
            'WhileVertex3(no, bottom)->ReturnVertex5\n');
    });

    it('from array to string', () => {
        assert.deepEqual(
            toStringArray(['let a = x + 1;','let b = a + y;','let c = 0;']), 'let a = x + 1;\n' +
            'let b = a + y;\n' +
            'let c = 0;\n');
    });

    it('from array to string2', () => {
        assert.deepEqual(
            toStringArray(['let a = x + 1;','let b = a + y;','let c = 0;']), 'let a = x + 1;\n' +
            'let b = a + y;\n' +
            'let c = 0;\n');
    });

});
