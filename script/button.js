function cursorButton(){
    cursorMode = true;
    resizeMode = false;
    lineMode = false;
    squareMode = false;
    polygonMode = false;
}

function resizeButton(){
    cursorMode = false;
    resizeMode = true;
    lineMode = true;
    squareMode = false;
    polygonMode = false;
}

function lineButton(){
    cursorMode = false;
    resizeMode = false;
    lineMode = true;
    squareMode = false;
    polygonMode = false;
}

var numVert;

function squareButton(){
    cursorMode = false;
    resizeMode = false;
    lineMode = false;
    squareMode = true;
    polygonMode = false;

    numVert = 2;
}

function polygonButton(){
    cursorMode = false;
    resizeMode = false;
    lineMode = false;
    squareMode = false;
    polygonMode = true;

    numVert = Number(prompt("Number of vertices", 5));
}

