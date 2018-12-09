import $ from 'jquery';
import {parseCode} from './code-analyzer';
import {main, tab} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        let arr = main(codeToParse);
        let table = tab(arr);
        $('#table').empty();
        $('#table').append(table);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
    });
});



