import $ from 'jquery';
import {parseCode} from './code-analyzer';
import {main, tab} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let arg =  $('#arguments').val();
        let parsedCode = parseCode(codeToParse);
        let parsedArguments;

      //  console.log(parsedArguments);
       // console.log(parsedCode);
        let arr = main(codeToParse, arg);
       // console.log(arr);
        // let table = tab(arr);
        // $('#table').empty();
        // $('#table').append(table);
        console.log(arr);
      //  $('#parsedCode').val(JSON.stringify(arr, null, 2));
        $('#parsedCode').val(arr);

    });
});



