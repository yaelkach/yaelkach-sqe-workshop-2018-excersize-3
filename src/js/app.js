import $ from 'jquery';
//import {parseCode} from './code-analyzer';
import {Program} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let arg =  $('#arguments').val();
        let colors = [];
        let arr = Program(codeToParse, arg,colors);
        $('#parsedCode').html(arr);

    });
});



