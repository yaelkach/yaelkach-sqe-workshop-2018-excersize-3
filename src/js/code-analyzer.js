import * as esprima from 'esprima';
import * as escodegen from 'escodegen';
export {main, parseCode};

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse);


};
let symbols = [];
const main = (code, args) =>{
    let json = esprima.parseScript(code);
    let argsJson;
    let arrArgs;
    if(args==='()'||args===''){
        arrArgs = undefined;
    }
    else{argsJson = esprima.parseScript(args);
        if(argsJson.body[0].expression.expressions===undefined){
            arrArgs = [argsJson.body[0].expression];
        }
        else{arrArgs = argsJson.body[0].expression.expressions;}}

    let env = [];
    json.body = globalOFunc(json.body, env, arrArgs);
    console.log(json);
    let ret = escodegen.generate(json);
    return ret;
};

const globalOFunc = (body, env, args)=>{
    for(let i=0; i<body.length; i++){
        if(body[i].type==='VariableDeclaration'){
            body [i] = globalVarDeclaration(body[i], env);
        }
        else{
            let b =  options(body[i], env, args);
            body[i] = b;
        }
    }
    return body;
};
const options = (body,env,args)=>{
    const funcObj = {FunctionDeclaration: functionDeclaration, VariableDeclaration: variableDeclaration, ExpressionStatement: assignmentExpression, WhileStatement: whileStatement, ReturnStatement: returnStatement, IfStatement: ifStatement};
    let type = body.type;
    let newEnv = [];
    switch (type){
    case 'IfStatement':
        newEnv = deepCopy(env);
        body = funcObj[type](body, env, newEnv);
        break;
    case 'WhileStatement':
        newEnv = deepCopy(env);
        body = funcObj[type](body, newEnv);
        break;
    default:
        body = funcObj[type](body, env, args);
        break;
    }
    return body;
};

const Body =(body, env,args)=>{

    for(let i=0; i<body.length; i++){
        body[i] = options(body[i],env,args);
    }
    return body;
};

const functionDeclaration = (func, env, args) =>{
    let params = func.params;
    for(let i=0; i<params.length; i++){
        symbols.push({name: params[i].name});
        env.push({name: params[i].name, obj: args[i].right});
    }
    let b = block(func.body.type,func.body, env);
    func.body = b;
    return func;
};

const variableDeclaration = (vardec, env) => {
    vardec.declarations.forEach((v) => {
        if (v.init.type === 'ArrayExpression') {
            let arr = v.init.elements;
            for (let i = 0; i < arr.length; i++) {
                let a = sub(arr[i], env, false);
                arr[i] = a;
            }
        }
        else if (v.init !== null) {
            sub(v.init, env, false);
        }
        let objCopy = JSON.parse(JSON.stringify(v.init));
        env.push({name: v.id.name, obj:objCopy});

    });
    return null;};

const globalVarDeclaration = (vardec,env)=>{
    vardec.declarations.forEach((v) => {
        if (v.init.type === 'ArrayExpression') {
            let arr = v.init.elements;
            for (let i = 0; i < arr.length; i++) {
                let a = sub(arr[i], env, false);
                arr[i] = a;
            }
        }
        else if (v.init !== null) {
            sub(v.init, env, false);
        }
        symbols.push({name: v.id.name});
        let objCopy = JSON.parse(JSON.stringify(v.init));
        env.push({name: v.id.name, obj:objCopy});}
    );
    return vardec;};

const inSymbolTable = (name) => {
    let found = false;
    for (let i = 0; i < symbols.length && !found; i++) {
        found = symbols[i].name === name ? true : false;
    }
    return found;
};
const MemberExpressionInAssignmentExpression = (e, env)=>{
    let name = e.left.object.name;
    let prop = sub(e.left.property, env, false);
    let s = sub(e.right, env, false);
    e.right = s;
    let found = false;
    for (let i = 0; i < env.length && !found; i++) {
        if (env[i].name === name) {
            found = true;
            let obj = env[i].obj;
            ArrayExpression(obj, prop, s);

        }
    }
}
const ArrayExpression = (obj, prop, s)=>{
    if (obj.type === 'ArrayExpression') {
        if(prop.type === 'Literal'){
            obj.elements[prop.value] = s;
        }
    }
}

const NormAssignmentExpression = (exp, env)=>{
    let e = exp.expression;
    let name = e.left.name;
    let s = sub(e.right, env, false);
    let copyObj = JSON.parse(JSON.stringify(s));
    e.right = s;

    let found = false;
    for (let i = 0; i < env.length && !found; i++) {
        if (env[i].name === name) {
            env[i].obj = copyObj;
            found = true;
        }
    }
    let inSymTab = inSymbolTable(name);
    return inSymTab ? exp : null;
}
const assignmentExpression = (exp, env) => {
    let e = exp.expression;
    if (e.left.type === 'MemberExpression') {
        MemberExpressionInAssignmentExpression(e,env);
        return exp;
    }
    else {
        return NormAssignmentExpression(exp,env);
    }
};

const whileStatement = (stat, env) => {
    let test = sub(stat.test, env, false);
    let testCopy = JSON.parse(JSON.stringify(test));
    let evaluate = sub(testCopy, env, true);
    let stringTest = escodegen.generate(evaluate);
    let evalT = eval(stringTest);
    let color = evalT? 'green' : 'red';
    stat.test = test;
    stat.test.color = color;
    console.log('color ' + color);
    let body = block(stat.body.type, stat.body, env);
    stat.body = body;
    return stat;
};

const ifStatement = (stat, env, newEnv) => {
    let test = sub(stat.test, env, false);
    let testCopy = JSON.parse(JSON.stringify(test));
    let evaluate = sub(testCopy, env, true);
    let stringTest = escodegen.generate(evaluate);
    let evalT = eval(stringTest);
    let color = evalT? 'green' : 'red';
    stat.test = test;
    stat.test.color = color;
    console.log('color ' + color);
    let consequent = block(stat.consequent.type, stat.consequent, newEnv);
    stat.consequent = consequent;
    if (stat.alternate !== null) {
        let alternate = block(stat.alternate.type, stat.alternate, env);
        stat.alternate = alternate;
    }
    return stat;
};

const returnStatement = (stat, env) => {
    let argument = sub(stat.argument, env, false);
    stat.argument = argument;
    return stat;
};

const block = (type, body, env) => {
    if (type === 'BlockStatement') {
        let b = Body(body.body, env);
        body.body = b.filter(exp=>exp);
        return body;
    }
    else {
        return options(body, env);
    }
};

const sub = (exp, env, evalTest) => {
    let type = exp.type;
    let ret;
    switch (type) {
    case 'BinaryExpression':
        ret = binaryExpression(exp, env, evalTest);
        break;
    case 'Identifier':
        ret = subIdentifier(exp,env, evalTest);
        break;
    case 'MemberExpression':
        ret = subMemberExpression(exp, env, evalTest);
        break;
    default:
        ret = exp;
    }
    return ret;

};
const subMemberExpression = (exp,env,evalTest) =>{
    let ret;
    let nam = exp.object.name;
    let prop = sub(exp.property, env, evalTest);
    let num = prop.value;
    let found2 = inSymbolTable(nam);
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
}
const subIdentifier = (exp,env,evalTest) =>{
    let ret;
    let name = exp.name;
    let found = inSymbolTable(name);
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
}
const subLocal = (exp, env) => {
    let found = false;
    for (let i = 0; i < env.length && !found; i++) {
        if (env[i].name === exp.name) {
            return env[i].obj;
        }
    }
};

const binaryExpression = (exp, env, evalTest) => {
    let left = exp.left;
    let right = exp.right;
    exp.left = sub(left, env, evalTest);
    exp.right = sub(right, env, evalTest);
    return exp;
};
const deepCopy = (env) => {
    let newEnv = [];
    env.forEach((v) => {
        let copyVal = JSON.parse(JSON.stringify(v.obj));
        newEnv.push({name: v.name, obj: copyVal});
    });
    return newEnv;
};