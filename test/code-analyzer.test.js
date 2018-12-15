import assert from 'assert';
import {parseCode, main, tab} from '../src/js/code-analyzer';


describe('The javascript parser', () => {
    it('is parsing a function with var, return, assignment, while, if and else if correctly', () => {
        assert.deepEqual(
            main(('function foo(x, y, z){\n' +
        'let a = x + 1;\n' +
        'let b = a + y;\n' +
        'let c = 0;\n' +
        'if (b < z) {\n' +
         '   c = c + 5;\n' +
          '  return x + y + z + c;\n' +
        '} else if (b < z * 2) {\n' +
          '  c = c + x + 5;\n' +
          '  return x + y + z + c;\n'+
       '} else {\n'+
          '  c = c + z + 5;\n'+
           ' return x + y + z + c;\n'+
       ' }'), '(X=1, y=2, z=3)'), 'function foo(x, y, z) {\n' +
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
//
// it('check for loop', () => {
//     assert.deepEqual(
//         JSON.stringify(main('function increaseByFive(x){for(let i=0; i<5; i++){x = x+1;}return arr;}')),
//         '[{"line":1,"type":"Function Declaration","name":"increaseByFive","condition":"","value":""},{"line":1,"type":"Variable Declaration","name":"x","condition":"","value":""},{"line":1,"type":"For Statement","name":"","condition":"i < 5","value":""},{"line":1,"type":"Assignment Expression","name":"x","condition":"","value":"x + 1"},{"line":1,"type":"Return Statement","name":"","condition":"","value":"arr"}]');
// });
//
// it('check while with no parentheses', () => {
//     assert.deepEqual(
//         JSON.stringify(main('function varDecCheck(){let low= 1;let high;}')),
//         '[{"line":1,"type":"Function Declaration","name":"varDecCheck","condition":"","value":""},{"line":1,"type":"Variable Declaration","name":"low","condition":"","value":"1"},{"line":1,"type":"Variable Declaration","name":"high","condition":"","value":""}]');
// });
// it('check html table', () => {
//     assert.deepEqual(
//         JSON.stringify(tab(main('function varDecCheck(){let low= 1;let high;}'))),
//         '"<table border=2><tr><td>Line</td><td>Type</td><td>Name</td><td>Condition</td><td>Value</td></tr><tr><td>1</td><td>Function Declaration</td><td>varDecCheck</td><td></td><td></td></tr><tr><td>1</td><td>Variable Declaration</td><td>low</td><td></td><td>1</td></tr><tr><td>1</td><td>Variable Declaration</td><td>high</td><td></td><td></td></tr></table>"');
// });
//
// it('check empty function', () => {
//     assert.deepEqual(
//         JSON.stringify(main('function empty(){}')),
//         '[{"line":1,"type":"Function Declaration","name":"empty","condition":"","value":""}]');
// });
//
// it('check empty input', () => {
//     assert.deepEqual(
//         JSON.stringify(main(' ')),
//         '[]');
// });
//
// it('check if else with parentheses', () => {
//     assert.deepEqual(
//         JSON.stringify(main('function isGreaterThanTen(x){if(x>10){return 1;}else {return 0;}}' )),
//         '[{"line":1,"type":"Function Declaration","name":"isGreaterThanTen","condition":"","value":""},{"line":1,"type":"Variable Declaration","name":"x","condition":"","value":""},{"line":1,"type":"If Statement","name":"","condition":"x > 10","value":""},{"line":1,"type":"Return Statement","name":"","condition":"","value":"1"},{"line":1,"type":"Return Statement","name":"","condition":"","value":"0"}]');
// });
//
// it('check else with parentheses', () => {
//     assert.deepEqual(
//         JSON.stringify(main('function isGreaterThanTen(x){if(x>10){return 1;}else if(x<0){return 2;} else{ return 0;}}' )),
//         '[{"line":1,"type":"Function Declaration","name":"isGreaterThanTen","condition":"","value":""},{"line":1,"type":"Variable Declaration","name":"x","condition":"","value":""},{"line":1,"type":"If Statement","name":"","condition":"x > 10","value":""},{"line":1,"type":"Return Statement","name":"","condition":"","value":"1"},{"line":1,"type":"Else-if Statement","name":"","condition":"x < 0","value":""},{"line":1,"type":"Return Statement","name":"","condition":"","value":"2"},{"line":1,"type":"Return Statement","name":"","condition":"","value":"0"}]');
// });
// it('check if else with no parentheses', () => {
//     assert.deepEqual(
//         JSON.stringify(main('function isGreaterThanTen(x){if(x>10)return 1;else return 0;}' )),
//         '[{"line":1,"type":"Function Declaration","name":"isGreaterThanTen","condition":"","value":""},{"line":1,"type":"Variable Declaration","name":"x","condition":"","value":""},{"line":1,"type":"If Statement","name":"","condition":"x > 10","value":""},{"line":1,"type":"Return Statement","name":"","condition":"","value":"1"},{"line":1,"type":"Return Statement","name":"","condition":"","value":"0"}]');
// });
//
// it('check codeParse', () => {
//     assert.deepEqual(
//         JSON.stringify(parseCode('function r(){return 1;}' )),
//         '{"type":"Program","body":[{"type":"FunctionDeclaration","id":{"type":"Identifier","name":"r","loc":{"start":{"line":1,"column":9},"end":{"line":1,"column":10}}},"params":[],"body":{"type":"BlockStatement","body":[{"type":"ReturnStatement","argument":{"type":"Literal","value":1,"raw":"1","loc":{"start":{"line":1,"column":20},"end":{"line":1,"column":21}}},"loc":{"start":{"line":1,"column":13},"end":{"line":1,"column":22}}}],"loc":{"start":{"line":1,"column":12},"end":{"line":1,"column":23}}},"generator":false,"expression":false,"async":false,"loc":{"start":{"line":1,"column":0},"end":{"line":1,"column":23}}}],"sourceType":"script","loc":{"start":{"line":1,"column":0},"end":{"line":1,"column":23}}}');
// });

