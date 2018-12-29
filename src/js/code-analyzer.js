import * as esprima from 'esprima';
import * as escodegen from 'escodegen';
export {Program, main};

const Program = (code, colors) =>{
    main(code,colors);
    makeStringForChart();
    console.log(vertices);
    console.log(edges);

};
let vertices;
let edges;
let index;
let ifCount;
const main = (code, colors) =>{
    vertices = [];
    edges = [];
    index = 0;
    ifCount = 0;
    let json = esprima.parseScript(code);

    globalOFunc(json.body);
    let ret = escodegen.generate(json);
    return ret;
};

const globalOFunc = (body)=>{
    for(let i=0; i<body.length; i++){
        if(body[i].type==='VariableDeclaration'){
            if(vertices.length===0|| vertices[vertices.length-1].type!=='LetOrAssignmentVertex'){
                index++;
                let vertex = {type: 'LetOrAssignmentVertex', array: [escodegen.generate(body[i])], index: index, name: 'LetOrAssignmentVertex'+index};
                addEdge(vertex);
                vertices.push(vertex);
            }
            else{
                vertices[vertices.length-1].array.push(escodegen.generate(body[i]));
            }
        }
        else{
            options(body[i]);
        }
    }

};
const options = (body)=>{
    const funcObj = {FunctionDeclaration: functionDeclaration, VariableDeclaration: variableDeclaration, ExpressionStatement: assignmentExpression, WhileStatement: whileStatement, ReturnStatement: returnStatement, IfStatement: ifStatement};
    funcObj[body.type](body);
};

const Body =(body)=>{
    for(let i=0; i<body.length; i++){
        options(body[i]);
    }
};

const functionDeclaration = (func) =>{
    block(func.body.type,func.body);
};

const variableDeclaration = (vardec) => {
    LetOrAssignment(vardec);
};

const LetOrAssignment = (exp) =>{
    if(vertices.length===0|| vertices[vertices.length-1].type!=='LetOrAssignmentVertex'){
        index++;
        let vertex = {type: 'LetOrAssignmentVertex', array: [escodegen.generate(exp)], index:index, name:'LetOrAssignmentVertex'+index};
        addEdge(vertex);
        vertices.push(vertex);
    }
    else{
        let vertex = vertices[vertices.length-1];
        vertex.array.push(escodegen.generate(exp));
    }
};

const assignmentExpression = (exp) => {
    LetOrAssignment(exp);
};

const whileStatement = (stat) => {
    index++;
    let nullVertex = {type: 'NullVertex', index: index, name: 'NullVertex'+index};
    addEdge(nullVertex);
    vertices.push(nullVertex);
    index++;
    let vertex = {type: 'WhileVertex', test: escodegen.generate(stat.test), index: index, name:'WhileVertex'+index};
    //vertex edge to points to consequent
    addEdge(vertex, true);
    vertices.push(vertex);
    block(stat.body.type, stat.body);
    //add edge from last vertex in while to null

    edges[edges.length-1].to = nullVertex.name;
    //add edge from while to doIfalse
    edges.push({from: vertex.name, to: undefined, isConsequent: false});

};

const ifStatement = (stat) => {
    ifCount ++;
    let counter = 1;
    index++;
    let vertex = {type: 'IfVertex', test: escodegen.generate((stat.test)), index: index, name: 'IfVertex'+index};
    //if edge to points to consequent
    addEdge(vertex, true);
    vertices.push(vertex);
    block(stat.consequent.type, stat.consequent);
    if (stat.alternate !== null) {
        stat.alternate.type==='IfStatement'? elseIfStatement(stat.alternate, vertex, counter): elseStatement(stat.alternate.type,stat.alternate, vertex, counter);
    }
};

const elseIfStatement = (stat, ifVertex, counter) => {
    index++;
    ifCount++;
    let elseIfVertex = {type: 'IfVertex', test: escodegen.generate((stat.test)), index: index, name:'IfVertex'+index};
    edges.push({from: ifVertex.name, to: elseIfVertex.name, isConsequent: false});
    edges.push({from: elseIfVertex.name, to: undefined, isConsequent: true});
    vertices.push(elseIfVertex, true);
    block(stat.consequent.type, stat.consequent);
    if (stat.alternate !== null) {
        if(stat.alternate.type==='IfStatement'){ elseIfStatement(stat.alternate, elseIfVertex, counter+1);}
        else {
            elseStatement(stat.alternate.type, stat.alternate, elseIfVertex, counter+1);
        }
    }
};

const elseStatement = (type, elseStat, ifStat, counter) =>{
   // let lastVertexIndex = vertices.length-1;
    edges.push({from: ifStat.name, to: undefined, isConsequent: false});
    if (type === 'BlockStatement'&&(elseStat.body[0].type === 'VariableDeclaration'||elseStat.body[0].type === 'ExpressionStatement' )) {
        index++;
        let vertex = {type: 'LetOrAssignmentVertex', array: [escodegen.generate(elseStat.body[0])], index: index, name: 'LetOrAssignmentVertex'+index};
        vertices.push(vertex);
        addEdge(vertex);
        //edges.push({from: vertex.name, to: undefined});
        let arrBody = elseStat.body.slice(1);
        if(arrBody.length !== 0) {
            Body(arrBody);
        }
    }
    else if(type === 'VariableDeclaration'|| type === 'ExpressionStatement'){
        index++;
        let vertex = {type: 'LetOrAssignmentVertex', array: [escodegen.generate(elseStat)], index:index, name:'LetOrAssignmentVertex'+index };
        vertices.push(vertex);
       // edges.push({from: vertex.name, to: undefined});
        addEdge(vertex);
    }
    else{
        block(type, elseStat);
    }
    // let elseName = lastEdge.to;
    //     // lastEdge.to = undefined;

    addDummyVertex(counter+1);

};

const returnStatement = (stat) => {
    index++;
    let returnVertex = {type: 'ReturnVertex', returnArgument: 'return ' + escodegen.generate(stat.argument), index: index, name: 'ReturnVertex'+index};
    addEdge(returnVertex);
    vertices.push(returnVertex);
};

const block = (type, body) => {
    if (type === 'BlockStatement') {
        Body(body.body);
    }
    else {
        options(body);
    }
};

const addEdge = (vertex, isConsequent) =>{
    if(edges.length===0)
        edges.push({from: vertex.name, to: undefined, isConsequent: isConsequent});
    else{
        let lastEdge = edges[edges.length-1];
        lastEdge.to = vertex.name;
        edges.push({from: vertex.name, to: undefined, isConsequent: isConsequent});
    }
};

const addDummyVertex = (counter) =>{
    counter++;
    let dummyIndex = index++;
    //go over all edges check which one does not point somewhere and point to dummy
    for(let i = edges.length-1; i>=0 ; i--){
        if(counter===0) break;
        if(edges[i].to === undefined){
            edges[i].to = 'DummyVertex' + dummyIndex;
            counter--;
        }
    }
    let dummy = {type: 'DummyVertex', index: dummyIndex, name: 'DummyVertex' + dummyIndex };
    vertices.push(dummy)
    addEdge(dummy);

};
const chartVertices = () =>{
    let str = '';
    vertices.forEach((vertex)=>{
        let type = vertex.type;
        str = str + vertex.name + '=>';
        switch(type) {
            case 'LetOrAssignmentVertex':
                let arr = toStringArray(vertex.array);
                str = str + 'operation: ' + arr ;
                break;
            case 'IfVertex':
                str = str + 'condition: ' + vertex.test + '\n';
                break;
            case 'WhileVertex':
                str = str + 'condition: ' + vertex.test + '\n';
                break;
            case 'NullVertex':
                str = str + 'operation: NULL \n';
                break;
            case 'ReturnVertex':
                str = str +  'operation: ' + vertex.returnArgument + '\n';
                break;
            case 'DummyVertex':
                str = str +  'operation: !\n';
                break;
        }
    });
    return str;
};

const toStringArray = (arr) =>{
    let str = '';
    for (let i =0; i<arr.length; i++){
        str = str + arr[i] + '\n';
    }
    return str;
};

const chartEdges = () =>{
    let str = '';
    edges.forEach((edge)=>{
        let from = edge.from;
        if(edge.to === undefined){
        }
        else if(edge.from.includes('LetOrAssignmentVertex')||edge.from.includes('NullVertex')||edge.from.includes('DummyVertex')){
            str = str + edge.from + '->' + edge.to + '\n';
        }
        else if(edge.from.includes('IfVertex')||edge.from.includes('WhileVertex')){
            if(edge.isConsequent){
                str = str + edge.from + '(yes)->' + edge.to + '\n';
            }
            else{
                str = str + edge.from + '(no)->' + edge.to + '\n';
            }
        }
    });
    return str;
};

const makeStringForChart = () =>{
    let chartV = chartVertices();
    let chartE = chartEdges();
    console.log(chartV);
    console.log(chartE);
};


//cond2(yes)->para

