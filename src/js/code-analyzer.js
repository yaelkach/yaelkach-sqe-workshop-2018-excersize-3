import * as esprima from 'esprima';
import * as escodegen from 'escodegen';
export {main, parseCode};


// use filter to take out null elements
const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse);


};
let symbols = [];
const main = (code) =>{
    let json = esprima.parseScript(code);
    let env = [];
    json.body = Body(json.body, env);
    return json;
};

const Body = (body, env)=>{

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
        default:
            body[i] = funcObj[type](body[i], env);
            break;
        }

    }
    return body;
};

const functionDeclaration = (func, env) =>{
    let params = func.params;
    params.forEach((p)=>{
        symbols.push({name: p.name, value: undefined});
    });
    let body = Body(func.body.body, env);
    func.body.body = body;
    return func;
};

const variableDeclaration = (vardec, env) => {
    vardec.declarations.forEach((v)=>{
        if(v.init !==null){
            sub(v.init, env);
        }
        env.push({name: v.id.name, obj: v.init});
    });
    //return null;
    return vardec;

};
const inSymbolTable = (name) =>{
    let found = false;
    for(let i=0; i<symbols.length&&!found; i++){
        found = symbols[i].name===name? true:false;
    }
    return found;
};

const assignmentExpression = (exp, env) =>{
    let e =exp.expression;
    let name = e.left.name;
    let value = escodegen.generate(e.right);
    let s = sub(e.right, env);
    env.push({name:name, obj:e.right});
    let found = inSymbolTable(name);
    return found? exp: null;
};
const whileStatement = (stat, env) =>{
    let condition = escodegen.generate(stat.test);
    let body = block(stat.body.type, stat.body, env);
    stat.body = body;
    return stat;
};

const ifStatement = (stat, env, newEnv) =>{
    let condition = escodegen.generate(stat.test);
    let consequent=  block(stat.consequent.type, stat.consequent,newEnv);
    console.log('env ' + env);
    console.log('new env' + newEnv);
    stat.consequent = consequent;
    if(stat.alternate!==null){
        let alternate = block(stat.alternate.type,stat.alternate, env);
        stat.alternate = alternate;
    }
    return stat;
};

const returnStatement = (stat, env) =>{
    let value = escodegen.generate(stat.argument);
    return stat;
};

const block = (type, body,env)=>{
    if(type === 'BlockStatement'){
        let b = Body(body.body, env);
        body.body = b;
        return body;
    }
    else{
        return Body([body],env);
    }
    //   return type ==='BlockStatement'? Body(body.body,env): Body([body],env);
};

const sub = (exp ,env)=>{
    let type = exp.type;
    let ret;
    switch(type){
    case 'BinaryExpression':
        ret = binaryExpression(exp, env);
        break;

    case 'Identifier':
        let name = exp.name;
        let found = inSymbolTable(name);
        if (!found) {
            ret = subLocal(exp,env);
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
const subLocal = (exp,env)=>{
    let found = false;
    for(let i=0; i<env.length&&!found; i++){
        if(env[i].name === exp.name){
            let type = env[i].obj.type;
            if(type ==='VariableDeclarator'){
                let s = env[i].obj.init;
                return s;
            }

        }
    }
};

const binaryExpression = (exp, env)=>{
    let left = exp.left;
    let right = exp.right;
    exp.left = sub(left, env);
    exp.right = sub(right, env);
};

const deepCopy = (env) =>{
    let newEnv = [];
    env.forEach((v)=>{
        newEnv.push({name: v.name, value: v.value});
    });
    return newEnv;
};


