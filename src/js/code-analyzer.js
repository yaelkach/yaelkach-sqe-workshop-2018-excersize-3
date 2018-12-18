import * as esprima from 'esprima';
import * as escodegen from 'escodegen';
export {Program, main};

const Program = (code, args, colors) =>{
    let m = main(code,args,colors);
    return colorProgram(m, colors);
};
const main = (code,args, colors) =>{
    let symbols = [];
    let json = esprima.parseScript(code);
    let argsJson;
    let arrArgs;
    if(args==='()'||args===''){
        arrArgs = [];
    }
    else{argsJson = esprima.parseScript(args);
        if(argsJson.body[0].expression.expressions===undefined){
            arrArgs = [argsJson.body[0].expression];
        }
        else{arrArgs = argsJson.body[0].expression.expressions;}}
    let env = [];
    json.body = globalOFunc(json.body, env ,symbols, colors, arrArgs);
    let ret = escodegen.generate(json);
    return ret;
};

const globalOFunc = (body, env,symbols,colors, args)=>{
    for(let i=0; i<body.length; i++){
        if(body[i].type==='VariableDeclaration'){
            body [i] = globalVarDeclaration(body[i], env,symbols);
        }
        else{
            let b =  options(body[i], env,symbols,colors, args);
            body[i] = b;
        }
    }
    return body;
};
const options = (body,env,symbols,colors, args)=>{
    const funcObj = {FunctionDeclaration: functionDeclaration, VariableDeclaration: variableDeclaration, ExpressionStatement: assignmentExpression, WhileStatement: whileStatement, ReturnStatement: returnStatement, IfStatement: ifStatement};
    let type = body.type;
    let newEnv = [];
    switch (type){
    case 'IfStatement':
        newEnv = deepCopy(env);
        body = funcObj[type](body, env, newEnv, symbols, colors);
        break;
    case 'WhileStatement':
        newEnv = deepCopy(env);
        body = funcObj[type](body, newEnv, symbols, colors);
        break;
    default:
        body = funcObj[type](body, env, symbols,colors, args);
        break;
    }
    return body;
};

const Body =(body, env, symbols,colors, args)=>{
    for(let i=0; i<body.length; i++){
        body[i] = options(body[i],env, symbols,colors, args);
    }
    return body;
};

const functionDeclaration = (func, env, symbols,colors, args) =>{
    let params = func.params;
    for(let i=0; i<params.length; i++){
        symbols.push({name: params[i].name});
        env.push({name: params[i].name, obj: args[i]});
    }
    let b = block(func.body.type,func.body, env, symbols, colors);
    func.body = b;
    return func;
};

const variableDeclaration = (vardec, env, symbols) => {
    vardec.declarations.forEach((v) => {
        if (v.init !== null) {
            if (v.init.type === 'ArrayExpression') {
                let arr = v.init.elements;
                for (let i = 0; i < arr.length; i++) {
                    let a = sub(arr[i], env, false, symbols);
                    arr[i] = a;
                }
            }
            else {
                sub(v.init, env, false, symbols);
            }
            let objCopy = JSON.parse(JSON.stringify(v.init));
            env.push({name: v.id.name, obj:objCopy});
        }
        else{
            env.push({name: v.id.name, obj:undefined});
        }});
    return null;};

const helper = (v, env, symbols)=>{
    symbols.push({name: v.id.name});
    let objCopy = JSON.parse(JSON.stringify(v.init));
    env.push({name: v.id.name, obj:objCopy});
};

const globalVarDeclaration = (vardec,env, symbols)=>{
    vardec.declarations.forEach((v) => {
        if (v.init === null) {
            symbols.push({name: v.id.name});
            env.push({name: v.id.name, obj:undefined});
        }
        else if (v.init.type === 'ArrayExpression') {
            let arr = v.init.elements;
            for (let i = 0; i < arr.length; i++) {
                let a = sub(arr[i], env, false, symbols);
                arr[i] = a;
            }
            helper(v,env,symbols);
        }
        else {
            sub(v.init, env, false, symbols);
            helper(v,env,symbols);}}
    );
    return vardec;};


const inSymbolTable = (name, symbols) => {
    let found = false;
    for (let i = 0; i < symbols.length && !found; i++) {
        found = symbols[i].name === name ? true : false;
    }
    return found;
};
const MemberExpressionInAssignmentExpression = (e, env, symbols)=>{
    let name = e.left.object.name;
    let prop = e.left.property.value;
    let s = sub(e.right, env, false, symbols);
    e.right = s;
    let found = false;
    for (let i = 0; i < env.length && !found; i++) {
        if (env[i].name === name) {
            found = true;
            let obj = env[i].obj;
            obj.elements[prop] = s;
        }
    }
};

const NormAssignmentExpression = (exp, env, symbols)=>{
    let e = exp.expression;
    let name = e.left.name;
    let s = sub(e.right, env, false, symbols);
    let copyObj = JSON.parse(JSON.stringify(s));
    e.right = s;

    let found = false;
    for (let i = 0; i < env.length && !found; i++) {
        if (env[i].name === name) {
            env[i].obj = copyObj;
            found = true;
        }
    }
    let inSymTab = inSymbolTable(name, symbols);
    return inSymTab ? exp : null;
};
const assignmentExpression = (exp, env, symbols) => {
    let e = exp.expression;
    if (e.left.type === 'MemberExpression') {
        MemberExpressionInAssignmentExpression(e,env, symbols);
        return exp;
    }
    else {
        return NormAssignmentExpression(exp,env, symbols);
    }
};

const whileStatement = (stat, env, symbols, colors) => {
    let test = sub(stat.test, env, false, symbols);
    let testCopy = JSON.parse(JSON.stringify(test));
    let evaluate = sub(testCopy, env, true, symbols);
    let stringTest = escodegen.generate(evaluate);
    let evalT = eval(stringTest);
    evalT? colors.push('green'): colors.push('red');
    stat.test = test;
    let body = block(stat.body.type, stat.body, env, symbols, colors);
    stat.body = body;
    return stat;
};

const ifStatement = (stat, env, newEnv, symbols, colors) => {
    let test = sub(stat.test, env, false, symbols);
    let testCopy = JSON.parse(JSON.stringify(test));
    let evaluate = sub(testCopy, env, true, symbols);
    let stringTest = escodegen.generate(evaluate);
    let evalT = eval(stringTest);
    evalT? colors.push('green'): colors.push('red');
    stat.test = test;
    let consequent = block(stat.consequent.type, stat.consequent, newEnv, symbols, colors);
    stat.consequent = consequent;
    if (stat.alternate !== null) {
        let alternate = block(stat.alternate.type, stat.alternate, env, symbols, colors);
        stat.alternate = alternate;
    }
    return stat;
};

const returnStatement = (stat, env, symbols) => {
    let argument = sub(stat.argument, env, false, symbols);
    stat.argument = argument;
    return stat;
};

const block = (type, body, env, symbols, colors) => {
    if (type === 'BlockStatement') {
        let b = Body(body.body, env,symbols, colors);
        body.body = b.filter(e=>e);
        return body;
    }
    else {
        return options(body, env,symbols, colors);
    }
};

const sub = (exp, env, evalTest, symbols) => {
    let type = exp.type;
    let ret;
    switch (type) {
    case 'BinaryExpression':
        ret = binaryExpression(exp, env, evalTest, symbols);
        break;
    case 'Identifier':
        ret = subIdentifier(exp,env, evalTest, symbols);
        break;
    case 'MemberExpression':
        ret = subMemberExpression(exp, env, evalTest, symbols);
        break;
    default:
        ret = exp;
    }
    return ret;

};
const subMemberExpression = (exp,env,evalTest, symbols) =>{
    let ret;
    let nam = exp.object.name;
    let prop = sub(exp.property, env, evalTest, symbols);
    let num = prop.value;
    let found2 = inSymbolTable(nam, symbols);
    if(!found2){
        let arr = (subLocal(exp.object, env, evalTest)).elements;
        ret = arr[num];
    }
    else if(evalTest){
        let arr = (subLocal(exp.object, env, evalTest)).elements;
        ret = arr[num];
    }
    else{
        ret = exp;
    }
    return ret;
};
const subIdentifier = (exp,env,evalTest, symbols) =>{
    let ret;
    let name = exp.name;
    let found = inSymbolTable(name, symbols);
    if (!found) {
        ret = subLocal(exp, env, evalTest);
    }
    else if(evalTest) {
        ret = subLocal(exp, env, evalTest);
    }
    else{
        ret = exp;
    }
    return ret;
};
const subLocal = (exp, env) => {
    let found = false;
    for (let i = 0; i < env.length && !found; i++) {
        if (env[i].name === exp.name) {
            return env[i].obj;
        }
    }
};

const binaryExpression = (exp, env, evalTest, symbols) => {
    let left = exp.left;
    let right = exp.right;
    exp.left = sub(left, env, evalTest, symbols);
    exp.right = sub(right, env, evalTest, symbols);
    return exp;
};
const deepCopy = (env) => {
    let newEnv = [];
    env.forEach((v) => {
        if(v.obj!==undefined) {
            let copyVal = JSON.parse(JSON.stringify(v.obj));
            newEnv.push({name: v.name, obj: copyVal});
        }
        else{
            newEnv.push({name: v.name, obj: undefined});
        }
    });
    return newEnv;
};

const colorProgram =(prog, colors)=>{
    let ls = prog.split('\n');
    let pr ='<pre>';
    ls.forEach((l)=>{
        pr = pr +colorLine(l, colors);
    });
    pr = pr +'</pre>';
    return pr;
};
const colorLine = (l, colors)=>{
    let ret;
    let closingPar = l.lastIndexOf(')') +1;
    let opening ='';
    if(l.lastIndexOf('{')+1>closingPar){
        opening = '{';
    }
    let changed = l.substring(0, closingPar);
    if(l.includes('while (')) {
        ret = '<span style="background-color:' +getColor(colors) + ';"> '+ changed +opening+' </span>';
    }
    else if (l.includes('else if (')) {
        ret = '<span style="background-color:' + getColor(colors) + ';"> '+ changed +opening+' </span>';
    }
    else if (l.includes('if (')) {
        ret = '<span style="background-color:' + getColor(colors) + ';"> '+ changed +opening+' </span>';
    }
    else{ret = l;}
    return '\n' +ret+ '\n';
};
const getColor = (colors)=>{
    let color ='';
    let found = false;
    for(let i=0; i<colors.length&&!found; i++){
        if(colors[i]!==''){
            found =true;
            color = colors[i];
            colors[i] = '';
        }
    }
    return color;
};