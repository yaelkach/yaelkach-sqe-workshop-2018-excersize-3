import * as esprima from 'esprima';
import * as escodegen from 'escodegen';
export {main, parseCode};


// use filter to take out null elements
const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse);


};
let symbols = [];
const main = (code, args) =>{
    let json = esprima.parseScript(code);
    let argsJson;
    let arrArgs;
    if(args==='()'||args===''){
        //argsJson = undefined;
        arrArgs = undefined;
    }
    else{argsJson = esprima.parseScript(args);
        if(argsJson.body[0].expression.expressions===undefined){
            arrArgs = [argsJson.body[0].expression];
        }
        else{arrArgs = argsJson.body[0].expression.expressions;}}

    let env = [];
    //let arr = argsJson.body[0].expression.expressions;
    json.body = globalOFunc(json.body, env, arrArgs);
    // let jsonFiltered = filtr(json.body);
    //console.log(escodegen.generate(json));
    console.log(json);
    let ret = escodegen.generate(json);
    //  let ret = JSON.stringify(json);
    return ret;
};

const globalOFunc = (body, env, args)=>{
    //let global = true;
    //  let count = 0;
    for(let i=0; i<body.length; i++){
        if(body[i].type==='VariableDeclaration'){
            body [i] = globalVarDeclaration(body[i], env);
        //    count++;
        }
        else{
            //global=false;
            // let restBody = body.slice(i);
            let b =  Body([body[i]], env, args)[0];
            body[i] = b;
        }
    }
    return body;
};

const Body =(body, env,args)=>{

    for(let i=0; i<body.length; i++){
        const funcObj = {FunctionDeclaration: functionDeclaration, VariableDeclaration: variableDeclaration, ExpressionStatement: assignmentExpression, WhileStatement: whileStatement, ReturnStatement: returnStatement, IfStatement: ifStatement};
        let type = body[i].type;
        let newEnv = [];
        switch (type){
        case 'IfStatement':
            newEnv = deepCopy(env);
            body[i] = funcObj[type](body[i], env, newEnv);
            break;
        case 'WhileStatement':
            newEnv = deepCopy(env);
            body[i] = funcObj[type](body[i], newEnv);
            break;
        case 'FunctionDeclaration':
            body[i] = funcObj[type](body[i],env,args);
            break;
        default:
            body[i] = funcObj[type](body[i], env);
            break;
        }

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
    // let body = Body(func.body.body, env);
    // func.body.body = body;
    return func;

    //  return vardec;

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

const assignmentExpression = (exp, env) => {
    let e = exp.expression;
    if (e.left.type === 'MemberExpression') {
        let name = e.left.object.name;
        let prop = sub(e.left.property, env, false);
        //  let copyObj = JSON.parse(JSON.stringify(s));
        let s = sub(e.right, env, false);
        e.right = s;
        let found = false;
        for (let i = 0; i < env.length && !found; i++) {
            if (env[i].name === name) {
                found = true;
                let obj = env[i].obj;
                if (obj.type === 'ArrayExpression') {
                    if(prop.type === 'Literal'){
                        obj.elements[prop.value] = s;
                    }

                }
            }
        }
        let inSymTab = inSymbolTable(name);
        //return inSymTab ? exp : null;
        return exp;
    }
    else {
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
    //return exp;
};

const whileStatement = (stat, env) => {
    //let subtest = sub(stat.test, env);
    let test = sub(stat.test, env, false);
    let testCopy = JSON.parse(JSON.stringify(test));
    let evaluate = sub(testCopy, env, true);
    let stringTest = escodegen.generate(evaluate);
    let evalT = eval(stringTest);
    // console.log('////////////////eval' + evalTest);
    let color = evalT? 'green' : 'red';
    stat.test = test;
    stat.test.color = color;
    console.log('color ' + color);
    let body = block(stat.body.type, stat.body, env);
    stat.body = body;
    return stat;
};

const ifStatement = (stat, env, newEnv) => {
    //let subtest =
    let test = sub(stat.test, env, false);
    let testCopy = JSON.parse(JSON.stringify(test));
    let evaluate = sub(testCopy, env, true);
    let stringTest = escodegen.generate(evaluate);
    let evalT = eval(stringTest);
    // console.log('////////////////eval' + evalTest);
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
    // block.body = newBlock.filter(exp=>exp);
    if (type === 'BlockStatement') {
        let b = Body(body.body, env);
        body.body = b.filter(exp=>exp);
        return body;
    }
    else {
        return Body([body], env)[0];
    }
    //   return type ==='BlockStatement'? Body(body.body,env): Body([body],env);
};

const sub = (exp, env, evalTest) => {
    let type = exp.type;
    let ret;
    switch (type) {
    case 'BinaryExpression':
        ret = binaryExpression(exp, env, evalTest);
        break;

    case 'Identifier':
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
        break;
    case 'MemberExpression':
        let nam = exp.object.name;
        let prop = sub(exp.property, env, evalTest);
        let num = prop.value;
        //  let copyObj = JSON.parse(JSON.stringify(s));
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

        break;
    default:
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