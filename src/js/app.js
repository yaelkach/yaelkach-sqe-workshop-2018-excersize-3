import $ from 'jquery';
import {Prog} from './colorJson.js';
import {Program} from './code-analyzer.js';
import flowchart from 'flowchart.js';


$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let arg =  $('#arguments').val();
        let colors = [];
        let prog = Prog(codeToParse, arg,colors);
        let arr = prog[0];
        let verticesAndEdges = Program(codeToParse, prog[1]);
        let vertices = verticesAndEdges[0];
        let edges = verticesAndEdges[1];
        $('#parsedCode').html(arr);
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



