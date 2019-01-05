import $ from 'jquery';
//import {parseCode} from './code-analyzer';
import {Prog} from './colorJson.js';
import {Program} from './code-analyzer.js';
import flowchart from 'flowchart.js';


$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let arg =  $('#arguments').val();
        let colors = [];
        console.log('/////////////////////////////////////////\n');
        let v =Program('function foo(arr, y, z){\n' +
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
            '}\n', '[5,6],2,3', ['red', 'green', 'red'])[0];
        console.log(v);
        let prog = Prog(codeToParse, arg,colors);
        console.log(prog[1]);
        let arr = prog[0];
        let verticesAndEdges = Program(codeToParse, prog[1]);
        let vertices = verticesAndEdges[0];
        let edges = verticesAndEdges[1];
        $('#parsedCode').html(arr);
      //  let input = eval('[' + $('#diagram').val() + ']');
        draw(vertices, edges);


    });
});

function draw(vertices, edges){
    $('#diagram').empty();
    let diagram = flowchart.parse( vertices + '\n' + edges);
    let options =
        {
            'flowstate' : {
                'green' : {'fill' : 'green'},
            }
        };
    diagram.drawSVG('diagram',options);
}



