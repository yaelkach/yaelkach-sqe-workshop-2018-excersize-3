import $ from 'jquery';
//import {parseCode} from './code-analyzer';
import {Prog} from './colorJson.js';
import {Program} from './code-analyzer.js';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let arg =  $('#arguments').val();
        let colors = [];
        let arr = Prog(codeToParse, arg,colors);
        Program(codeToParse, colors);
        $('#parsedCode').html(arr);

    });
});



