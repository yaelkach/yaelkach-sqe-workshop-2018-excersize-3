import $ from 'jquery';
//import {parseCode} from './code-analyzer';
import {Prog} from './colorJson.js';
import {Program} from './code-analyzer.js';
import fc from 'flowchart.js';


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
        let input = eval('[' + $('#diagram').val() + ']');
        let graph = getGraph(parsedCode,input);
        nodesList = graph.nodes;
        edgesList = graph.edges;
        allNodes = graph.allNodes;
        draw(vertices, edges);


    });
});

function draw(vertices, edges){
    $('#diagram').empty();
    let diagram = fc.parse( vertices + '\n' + edges);
   // addNumbersToNodes(diagram.start);
    let options =
        {
            'flowstate' : {
                'green' : {'fill' : 'green'},
            }
        };
    diagram.drawSVG('diagram',options);
}



