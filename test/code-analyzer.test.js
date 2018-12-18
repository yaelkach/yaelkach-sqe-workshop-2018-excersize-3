import assert from 'assert';
import {main, Program} from '../src/js/code-analyzer';


describe('The javascript parser', () => {
    it('testing program without parenthesess', () => {
        assert.deepEqual(
            Program('let count;       \n' +
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
                '                }', '(x=6, y=4)', []), '<pre>\n' +
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
    it('testing program with parenthesess', () => {
        assert.deepEqual(
            Program('function loo(x,y){\n' +
                'let c =0;             \n' +
                'while(c<y){             \n' +
                'count = c +1;\n' +
                '     }            \n' +
                'if(x>y){\n' +
                'count = c+2;\n' +
                '}\n' +
                'else if(x<y){\n' +
                'c = c+3;\n' +
                '}\n' +
                'else{\n' +
                'c = c+4;\n' +
                '}\n' +
                '\n' +
                'return z;\n' +
                '                }', '(x=2, y=3)', []), '<pre>\n' +
            'function loo(x, y) {\n' +
            '\n' +
            '<span style="background-color:green;">     while (0 < y){ </span>\n' +
            '\n' +
            '    }\n' +
            '\n' +
            '<span style="background-color:red;">     if (x > y){ </span>\n' +
            '\n' +
            '<span style="background-color:green;">     } else if (x < y){ </span>\n' +
            '\n' +
            '    } else {\n' +
            '\n' +
            '    }\n' +
            '\n' +
            '    return;\n' +
            '\n' +
            '}\n' +
            '</pre>');
    });
    it('testing global init is null', () => {
        assert.deepEqual(
            main('let count;\n' +
                'function moo(x,y){\n' +
                'count =0;\n' +
                'while(x<y){\n' +
                'count = count +1;\n' +
                '}\n' +
                '}', '(x=6, y=4)', []), 'let count;\n' +
            'function moo(x, y) {\n' +
            '    count = 0;\n' +
            '    while (x < y) {\n' +
            '        count = count + 1;\n' +
            '    }\n' +
            '}');
    });

    it('testing global array', () => {
        assert.deepEqual(
            main('let arr = [1,2,3];\n' +
                'function goo(x){\n' +
                'if(x<arr[2]){\n' +
                'return 1;\n' +
                '}\n' +
                '}', '(x=6)', []), 'let arr = [\n' +
            '    1,\n' +
            '    2,\n' +
            '    3\n' +
            '];\n' +
            'function goo(x) {\n' +
            '    if (x < arr[2]) {\n' +
            '        return 1;\n' +
            '    }\n' +
            '}');
    });
    // it('testing assignment arrays2', () => {
    //     assert.deepEqual(
    //         main('function checkSameArr(arr){\n' +
    //             'arr[0] = arr[1];\n' +
    //             'let c=4;\n' +
    //             'if(arr[0]<c){\n' +
    //             'c = c+1;\n' +
    //             'return c;\n' +
    //             '}\n' +
    //             'else{\n' +
    //             'c=c+2;\n' +
    //             'return arr[0];\n' +
    //             '}\n' +
    //             '}', '(arr=[1,2,3])', []), 'function checkSameArr(arr) {\n' +
    //         '    arr[0] = arr[1];\n' +
    //         '    if (arr[0] < 4) {\n' +
    //         '        return 4 + 1;\n' +
    //         '    } else {\n' +
    //         '        return arr[0];\n' +
    //         '    }\n' +
    //         '}');
    // });
    it('testing assignment arrays', () => {
        assert.deepEqual(
            main('function foo(){\n' +
                'let c=0;\n' +
                'let arr = [1,2];\n' +
                'arr[0] = arr[1];\n' +
                'return arr[0] +c;\n' +
                '}', '', []), 'function foo() {\n' +
            '    arr[0] = 2;\n' +
            '    return 2 + 0;\n' +
            '}');
    });

    it('testing uninitialized variables', () => {
        assert.deepEqual(
            main('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                'let d;\n' +
                '    \n' +
                '    while (a < z) {\n' +
                '        c = a + b;\n' +
                '        z = c * 2;\n' +
                'd=0;\n' +
                '    }\n' +
                '    \n' +
                '    return z;\n' +
                '}\n', '(x=0, y=1, z=2)', []), 'function foo(x, y, z) {\n' +
            '    while (x + 1 < z) {\n' +
            '        z = (x + 1 + (x + 1 + y)) * 2;\n' +
            '    }\n' +
            '    return z;\n' +
            '}');
    });
    it('testing arrays', () => {
        assert.deepEqual(
            main('function firstElementEqual(arr){\n' +
                'let arr2 = [1,2,3];\n' +
                'if(arr[0]<arr2[0])\n' +
                'return 1;\n' +
                'else\n' +
                'return 0;\n' +
                '}', '(arr=[1,2,4])', []), 'function firstElementEqual(arr) {\n' +
            '    if (arr[0] < 1)\n' +
            '        return 1;\n' +
            '    else\n' +
            '        return 0;\n' +
            '}');
    });
    it('testing while', () => {
        assert.deepEqual(
            main('function foo(){\n' +
                '    let a =2;\n' +
                'while(a<6){\n' +
                'a=a+1;\n' +
                '}\n' +
                '}\n', '', []), 'function foo() {\n' +
            '    while (2 < 6) {\n' +
            '    }\n' +
            '}');
    });
    it('testing global with function', () => {
        assert.deepEqual(
            main('let global = 0;\n' +
                'function addGlobal(x){\n' +
                'global = global+x;\n' +
                '}\n', '(x=1)', []), 'let global = 0;\n' +
            'function addGlobal(x) {\n' +
            '    global = global + x;\n' +
            '}');
    });
    it('testing if and assignment', () => {
        assert.deepEqual(
            main('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        c = c + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else if (b < z * 2) {\n' +
                '        c = c + x + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else {\n' +
                '        c = c + z + 5;\n' +
                '        return x + y + z + c;\n' +
                '    }\n' +
                '}\n', '(x=1, y=2, z=3)', []), 'function foo(x, y, z) {\n' +
            '    if (x + 1 + y < z) {\n' +
            '        return x + y + z + (0 + 5);\n' +
            '    } else if (x + 1 + y < z * 2) {\n' +
            '        return x + y + z + (0 + x + 5);\n' +
            '    } else {\n' +
            '        return x + y + z + (0 + z + 5);\n' +
            '    }\n' +
            '}');
    });
});
