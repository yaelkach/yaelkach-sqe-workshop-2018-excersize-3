import * as esprima from 'esprima';
import * as escodegen from 'escodegen';
export {main, tab, parseCode};

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, {loc:true});


};
const main = (code) =>{
    let json = esprima.parseScript(code, {loc:true});
    return Body(json.body);
};

const Body = (body)=>{
    let ret = [];
    for(let i=0; i<body.length; i++){
        let y = body[i];
        const funcObj = {FunctionDeclaration: functionDeclaration, VariableDeclaration: variableDeclaration, ExpressionStatement: assignmentExpression, WhileStatement: whileStatement, ReturnStatement: returnStatement, IfStatement: ifStatement ,ForStatement: forStatement };
        let type = y.type;
        switch (type) {
        case 'IfStatement':
            ret = ret.concat(funcObj[type](y, 'If Statement'));
            break;
        default:
            ret = ret.concat(funcObj[type](y));
            break;
        }
    }
    return ret;
};

const functionDeclaration = (func) =>{
    let params = func.params;
    let line = func.loc.start.line;
    let type = 'Function Declaration';
    let name = func.id.name;

    let ret =[{line: line, type: type, name: name, condition: '', value: ''}];
    params.forEach((p)=>{
        let pLine = p.loc.start.line;
        ret.push({line: pLine, type: 'Variable Declaration',name: p.name, condition: '', value: ''});
    });
    return ret.concat(Body(func.body.body));
};
const variableDeclaration = (vardec) => {
    let ret = [];
    let type = 'Variable Declaration';
    vardec.declarations.forEach((v)=>{
        let line = v.loc.start.line;
        let value = v.init === null ? '' :  escodegen.generate(v.init);
        ret.push({line: line, type: type, name: v.id.name, condition: '', value: value});
    });
    return ret;
};

const assignmentExpression = (exp) =>{
    let e =exp.expression;
    let line = e.loc.start.line;
    let type = 'Assignment Expression';
    let value = escodegen.generate(e.right);
    return [{line: line, type: type, name: e.left.name, condition: '', value: value}];
};
const whileStatement = (stat) =>{
    let line = stat.loc.start.line;
    let type = 'While Statement';
    let condition = escodegen.generate(stat.test);
    let ret = [{line: line, type: type, name: '', condition: condition, value: ''}];

    let body = block(stat.body.type, stat.body);
    return ret.concat(body);
};
const elseIfStatement =(stat) =>{
    let line = stat.loc.start.line;
    let type = 'Else-if Statement';
    let condition = escodegen.generate(stat.test);
    let ret = [{line: line, type: type, name: '', condition: condition, value: ''}];

    let consequent= block(stat.consequent.type, stat.consequent);
    ret = ret.concat(consequent);

    let t = stat.alternate.type;
    let alternate = t==='IfStatement'? elseIfStatement(stat.alternate):block(t,stat.alternate);

    return ret.concat(alternate);
};
const ifStatement = (stat) =>{
    let type = 'If Statement';
    let line = stat.loc.start.line;
    let condition = escodegen.generate(stat.test);
    let ret = [{line: line, type: type, name: '', condition: condition, value: ''}];

    let consequent= block(stat.consequent.type, stat.consequent);
    ret = ret.concat(consequent);

    let t = stat.alternate.type;
    let alternate = t==='IfStatement'? elseIfStatement(stat.alternate): block(t,stat.alternate);

    return ret.concat(alternate);
};
const returnStatement = (stat) =>{
    let line = stat.loc.start.line;
    let type = 'Return Statement';
    let value = escodegen.generate(stat.argument);
    return [{line: line, type: type, name: '', condition: '', value: value}];
};
const forStatement = (stat) =>{
    let line = stat.loc.start.line;
    let type = 'For Statement';
    let condition = escodegen.generate(stat.test);
    let ret = [{line: line, type: type, name: '', condition: condition, value: ''}];

    let body = block(stat.body.type, stat.body);
    return ret.concat(body);
};
const block = (type, body)=>{
    return type ==='BlockStatement'? Body(body.body): Body([body]);
};

function tab(array) {
    let a = new Array(array.length);
    for(let i=0; i<array.length; i++){
        a[i] = [array[i].line, array[i].type, array[i].name, array[i].condition, array[i].value];
    }
    let titles = [['Line', 'Type','Name', 'Condition', 'Value']];
    let a2 = titles.concat(a);
    let r = '<table border=2>';
    for(let i=0; i<a2.length; i++) {
        r += '<tr>';
        for(let j=0; j<a2[i].length; j++){
            r += '<td>'+a2[i][j]+'</td>';
        }
        r += '</tr>';
    }
    r += '</table>';

    return r;
}
