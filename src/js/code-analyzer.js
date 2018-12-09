import * as esprima from 'esprima';
import * as escodegen from 'escodegen';
export {main, parseCode};


// use filter to take out null elements
const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, {loc:true});


};
let symbols = [];
const main = (code) =>{
    let json = esprima.parseScript(code, {loc:true});
    let env = [];
    json.body = Body(json.body, env);
    return json;
};

const Body = (body, env)=>{

    for(let i=0; i<body.length; i++){
        const funcObj = {FunctionDeclaration: functionDeclaration, VariableDeclaration: variableDeclaration, ExpressionStatement: assignmentExpression, WhileStatement: whileStatement, ReturnStatement: returnStatement, IfStatement: ifStatement, BlockStatement: blockStatement};
        let type = body[i].type;
        let newEnv = [];
        switch (type){
        case 'IfStatement' || 'WhileStatement':
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
    let body = Body(func.body, env);
    func.body = body;
    return func;
};

const variableDeclaration = (vardec, env) => {
    vardec.declarations.forEach((v)=>{
        let value = v.init === null ? '' :  escodegen.generate(v.init);
        env.push({name: v.id.name, value: value});
    });
    return null;

};

const assignmentExpression = (exp, env) =>{
    let e =exp.expression;
    let name = e.left.name;
    let value = escodegen.generate(e.right);
    env.push({name:name, value:value});
    return null;
};
const whileStatement = (stat, env) =>{
    let condition = escodegen.generate(stat.test);
    let body = Body(stat.body, env);
    stat.body = body;
    return stat;
};

const ifStatement = (stat, env) =>{
    let condition = escodegen.generate(stat.test);
    let consequent= Body(stat.consequent, env);
    stat.consequent = consequent;
    if(stat.alternate!==null){
        let alternate = Body(stat.alternate, env);
        stat.alternate = alternate;
    }
    return stat;
};

const returnStatement = (stat, env) =>{
    let value = escodegen.generate(stat.argument);
    return stat;
};

const blockStatement = (body, env)=>{
    return Body(body.body, env);
};
const deepCopy = (env) =>{
    let newEnv = [];
    env.forEach(v=>{
        newEnv.push({name: v.name, value: v.value});
    })
    return newEnv;
}


