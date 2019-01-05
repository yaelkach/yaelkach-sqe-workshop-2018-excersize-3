import * as esprima from 'esprima';
import * as escodegen from 'escodegen';
export {Program, main, toStringArray};

const Program = (code, colors) =>{
    main(code,colors);
    return makeStringForChart();


};
let vertices;
let edges;
let index;
let colors;
let colorIndex;
let IfCount;
const main = (code, c) =>{
    colors = c;
    vertices = [];
    edges = [];
    index = 0;
    IfCount = 0;
    colorIndex = 0;
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
                let vertex = {type: 'LetOrAssignmentVertex', array: [escodegen.generate(body[i])], index: index, name: 'LetOrAssignmentVertex'+index, color: 'green'};
                addEdge(vertex);
                vertices.push(vertex);
            }
            else{
                vertices[vertices.length-1].array.push(escodegen.generate(body[i]));
            }
        }
        else{
            options(body[i], 'green');
        }
    }

};
const options = (body, color)=>{
    const funcObj = {FunctionDeclaration: functionDeclaration, VariableDeclaration: variableDeclaration, ExpressionStatement: assignmentExpression, WhileStatement: whileStatement, ReturnStatement: returnStatement, IfStatement: ifStatement};
    funcObj[body.type](body, color);
};

const Body =(body, color)=>{
    for(let i=0; i<body.length; i++){
        options(body[i], color);
    }
};

const functionDeclaration = (func, color) =>{
    block(func.body.type,func.body, color);
};

const variableDeclaration = (vardec, color) => {
    LetOrAssignment(vardec, color);
};

const LetOrAssignment = (exp, color) =>{
    if(vertices.length===0|| vertices[vertices.length-1].type!=='LetOrAssignmentVertex'){
        index++;
        let vertex = {type: 'LetOrAssignmentVertex', array: [escodegen.generate(exp)], index:index, name:'LetOrAssignmentVertex'+index, color: color};
        addEdge(vertex);
        vertices.push(vertex);
    }
    else{
        let vertex = vertices[vertices.length-1];
        vertex.array.push(escodegen.generate(exp));
    }
};

const assignmentExpression = (exp, color) => {
    LetOrAssignment(exp, color);
};

const whileStatement = (stat, color) => {
    index++;
    let nullVertex = {type: 'NullVertex', index: index, name: 'NullVertex'+index, color:color};
    addEdge(nullVertex);
    vertices.push(nullVertex);
    index++;
    let whileColor = colors[colorIndex];
    colorIndex++;
    let vertex = {type: 'WhileVertex', test: escodegen.generate(stat.test), index: index, name:'WhileVertex'+index, color: color};
    addEdge(vertex, true);
    vertices.push(vertex);
    block(stat.body.type, stat.body, whileColor);
    edges[edges.length-1].to = nullVertex.name;
    edges.push({from: vertex.name, to: undefined, isConsequent: false});

};

const ifStatement = (stat, color) => {
    let ifColor = colors[colorIndex];
    colorIndex++;
    IfCount++;
    let counter = 1;
    index++;
    let vertex = {type: 'IfVertex', test: escodegen.generate((stat.test)), index: index, name: 'IfVertex'+index, color: color};
    //if edge to points to consequent
    addEdge(vertex, true);
    vertices.push(vertex);
    block(stat.consequent.type, stat.consequent, ifColor);
    if (stat.alternate !== null) {
        stat.alternate.type==='IfStatement'? elseIfStatement(stat.alternate, vertex, counter, color): elseStatement(stat.alternate.type,stat.alternate, vertex, counter, color);
    }
    else{
        addDummyVertex(counter+1);
    }
};

const elseIfStatement = (stat, ifVertex, counter, color) => {
    let colorOfBeforeIfs = 'red';
    for(let i = colorIndex-IfCount; i<IfCount; i++) {
        /*if (colors[i] === 'green') { ret
            colorOfBeforeIfs = 'green';
            break;}*/
        colorOfBeforeIfs = 'green';
    }
    let elseColor = colorOfBeforeIfs ==='green'? 'red': colors[colorIndex];
    colorIndex++;
    IfCount++;
    index++;
    let elseIfVertex = {type: 'IfVertex', test: escodegen.generate((stat.test)), index: index, name:'IfVertex'+index, color: color};
    edges.push({from: ifVertex.name, to: elseIfVertex.name, isConsequent: false});
    edges.push({from: elseIfVertex.name, to: undefined, isConsequent: true});
    vertices.push(elseIfVertex);
    block(stat.consequent.type, stat.consequent, elseColor);
    elseIfAlternate(stat.alternate, elseIfVertex, counter);

};
const elseIfAlternate = (alternate, elseIfVertex, counter) =>{
    if (alternate !== null) {
        if(alternate.type==='IfStatement'){ elseIfStatement(alternate, elseIfVertex, counter+1);}
        else {
            elseStatement(alternate.type, alternate, elseIfVertex, counter+1);
        }
    }
    else{
        addDummyVertex(counter+1);
    }
};

const elseStatement = (type, elseStat, ifStat, counter) =>{
    let color = getElseColor();
    edges.push({from: ifStat.name, to: undefined, isConsequent: false});
    //ret
    //if ( isBlockAndVarOrExp(type, elseStat.body[0])) {
    index++;
    let vertex = {type: 'LetOrAssignmentVertex', array: [escodegen.generate(elseStat.body[0])], index: index, name: 'LetOrAssignmentVertex'+index, color: color};
    vertices.push(vertex);
    addEdge(vertex);
    let arrBody = elseStat.body.slice(1);
    if(arrBody.length !== 0) { Body(arrBody);  }
    //}
    /*  else if(type === 'VariableDeclaration'|| type === 'ExpressionStatement'){
        index++;
        let vertex = {type: 'LetOrAssignmentVertex', array: [escodegen.generate(elseStat)], index:index, name:'LetOrAssignmentVertex'+index, color:color };
        vertices.push(vertex);
        addEdge(vertex); }
    else{
        block(type, elseStat, color);}*/
    addDummyVertex(counter+1);

};

/*const isBlockAndVarOrExp = (type, body)=>{
    return type === 'BlockStatement'&&(body.type === 'VariableDeclaration'||body.type === 'ExpressionStatement' );

};*/
const getElseColor = () =>{
    let color = 'green';
    for(let i = colorIndex-IfCount; i<IfCount; i++){
        if(colors[i]==='green') {
            color = 'red';
            break;
        }
    }
    return color;
};

const returnStatement = (stat) => {
    index++;
    let returnVertex = {type: 'ReturnVertex', returnArgument: 'return ' + escodegen.generate(stat.argument), index: index, name: 'ReturnVertex'+index, color: 'green'};
    addEdge(returnVertex);
    vertices.push(returnVertex);
};

const block = (type, body, color) => {
    //ret
    /* if (type === 'BlockStatement') {
        Body(body.body, color);
    }
    else {
        options(body, color);
    }*/
    Body(body.body, color);
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
        //ret
        //if(counter===0) break;
        if(edges[i].to === undefined){
            edges[i].to = 'DummyVertex' + dummyIndex;
            counter--;
        }
    }
    let dummy = {type: 'DummyVertex', index: dummyIndex, name: 'DummyVertex' + dummyIndex , color: 'green'};
    vertices.push(dummy);
    addEdge(dummy);

};
const chartVertices = () =>{
    let str = '';
    const funcObj = {LetOrAssignmentVertex: letOrAssignmentVertex, IfVertex: whileOrIfVertex, WhileVertex: whileOrIfVertex, ReturnVertex: returnVertex, DummyVertex: dummyVertex};
    let vertexIndex =1;
    vertices.forEach((vertex)=>{
        str = str + vertex.name + '=>';
        if(vertex.type==='NullVertex')
            str = str + nullVertex(vertexIndex);
        else {
            str = str + funcObj[vertex.type](vertex, vertexIndex);
        }
        if(vertex.type!=='DummyVertex')
            vertexIndex++;

        /*let type = vertex.type;
        str = str + vertex.name + '=>';
        switch(type) {
        case 'LetOrAssignmentVertex':
            str = str + 'operation: ' + toStringArray(vertex.array);
            break;
        case 'IfVertex':
            str = str + 'condition: ' + vertex.test;
            break;
        case 'WhileVertex':
            str = str + 'condition: ' + vertex.test;
            break;
        case 'NullVertex':
            str = str + 'operation: NULL';
            break;
        case 'ReturnVertex':
            str = str +  'operation: ' + vertex.returnArgument ;
            break;
        case 'DummyVertex':
            str = str +  'end: .';
            break;
        }*/
        if(vertex.color==='green')
            str = str + '|green\n';
        else
            str = str + '\n';
    });
    return str;
};
const letOrAssignmentVertex = (vertex,index) =>{
    return 'operation: ' +index+')  '+ toStringArray(vertex.array);
};
const whileOrIfVertex = (vertex , index)=>{
    return 'condition: ' +index+')  '+ vertex.test;
};
const nullVertex = (index) =>{
    return 'operation:  '+index+')  +  NULL';
};
const returnVertex = (vertex,index)=>{
    return 'operation: '  +index+')  '+  vertex.returnArgument ;
};
const dummyVertex = () =>{
    return 'end: .';
};

const toStringArray = (arr) =>{
    console.log('***********************************');
    console.log(arr);
    let str = '';
    for (let i =0; i<arr.length; i++){
        str = str + arr[i] + '\n';
    }
    console.log(str);
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
        else if(edge.from.includes('IfVertex')){
            if(edge.isConsequent){
                str = str + edge.from + '(yes)->' + edge.to + '\n';
            }
            else{
                str = str + edge.from + '(no)->' + edge.to + '\n';
            }
        }
        else if(edge.from.includes('WhileVertex')){
            if(edge.isConsequent){
                str = str + edge.from + '(yes, right)->' + edge.to + '\n';
            }
            else{
                str = str + edge.from + '(no, bottom)->' + edge.to + '\n';
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
    return[chartV, chartE];
};


//cond2(yes)->para

