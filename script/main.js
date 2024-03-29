var vertices = [];
var colors = [];
var objects = [];
var offset = 0;
var jsonData = {};

const canvas = document.querySelector('#glcanvas');
canvas.width = 1000;
canvas.height = 1000;
// Initialize the GL context
const gl = canvas.getContext('webgl');

if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
}

// Vertex shader source code
var vertCode = 'attribute vec3 coordinates;' +
    'attribute vec3 color;' +
    'varying vec3 vColor;' +
    'void main(void) {' +
    ' gl_Position = vec4(coordinates, 1.0);' +
    'vColor = color;' +
    '}';

// Create a vertex shader object
var vertShader = gl.createShader(gl.VERTEX_SHADER);

// Fragment shader source code
var fragCode = 'precision mediump float;' +
    'varying vec3 vColor;' +
    'void main(void) {' +
    'gl_FragColor = vec4(vColor, 1.);' +
    '}';

// Create fragment shader object
var fragShader = gl.createShader(gl.FRAGMENT_SHADER);

// Create a shader program object to store
var shaderProgram = gl.createProgram();

function setupShader() {
    // Attach vertex shader source code
    gl.shaderSource(vertShader, vertCode);
    // Compile the vertex shader
    gl.compileShader(vertShader);
    // Attach fragment shader source code
    gl.shaderSource(fragShader, fragCode);
    // Compile the fragmentt shader
    gl.compileShader(fragShader);
}

function setupProgram() {
    // Attach a vertex shader
    gl.attachShader(shaderProgram, vertShader);
    // Attach a fragment shader
    gl.attachShader(shaderProgram, fragShader);
    // Link both the programs
    gl.linkProgram(shaderProgram);
}
setupShader();
setupProgram();

function getMousePosition(canvas, event) {
    let temp = [];
    let rect = canvas.getBoundingClientRect();
    let x = ((event.clientX - rect.left) / (canvas.width)) * 2 - 1;
    let y = -((event.clientY - rect.top) / (canvas.height)) * 2 + 1;

    temp.push(x);
    temp.push(y)
    return (temp);
}

var vertex_buffer = gl.createBuffer();
var color_buffer = gl.createBuffer();

function setUpBuffer() {
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

    var coord = gl.getAttribLocation(shaderProgram, "coordinates");

    gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(coord);

    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);

    var color = gl.getAttribLocation(shaderProgram, "color");

    gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(color);

    gl.clearColor(0, 0, 0, 0);

    gl.enable(gl.DEPTH_TEST);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.viewport(0, 0, canvas.width, canvas.height);
}

function draw() {
    gl.useProgram(shaderProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    for (var i = 0; i < objects.length; i++) {
        console.log(objects[i]);
        gl.drawArrays(objects[i].mode, objects[i].off, objects[i].count);
    }
}

var canvasElem = document.querySelector("#glcanvas");
var vec;
var selectedVertex = -1;
var selectedObject;
var vertexCount = 0;
var vecTemp = [];
var backupVertices;
var rVal;
var gVal;
var bVal;
setUpBuffer();

canvasElem.addEventListener('mousedown', (e) => {
    updateColor();
    vec = getMousePosition(canvasElem, e);
    if (resizeMode || cursorMode) {
        //selectedVertex = -1;
        if (selectedVertex != -1) {
            console.log(selectedVertex);
            //console.log(objects);
            for (var i = objects.length - 1; i >= 0; i--) {
                //console.log(objects[i].off)
                if (objects[i].off * 2 <= selectedVertex) {
                    selectedObject = i;
                    break;
                }
                selectedObject = 0;
            }
            if (resizeMode) {
                console.log("masuk");
                vertices[selectedVertex] = vec[0];
                vertices[selectedVertex + 1] = vec[1];
                selectedVertex = -1;
                draw();
            }
        } else {
            selectedObject = -1;
            for (var i = 0; i < vertices.length; i += 2) {
                if (((vertices[i]).toFixed(1) == (vec[0]).toFixed(1))
                    && ((vertices[i + 1]).toFixed(1) == (vec[1]).toFixed(1))) {
                    //console.log(i);
                    selectedVertex = i;
                    break;
                }
            }
        }

        backupVertices = vertices.slice();
    }
    else if (!cursorMode && !resizeMode) {
        vertices.push(vec[0]);
        vertices.push(vec[1]);
        console.log(vertices);
        if (lineMode == true) {
            //line here
            vertexCount += 1;
            colors.push(rVal, gVal, bVal);
            if (vertexCount == 2) {
                objects.push({
                    "name": "line",
                    "mode": gl.LINES,
                    "off": offset,
                    "count": 2
                });
                offset += 2;
                vertexCount = 0;
            }
        }
        else if (squareMode == true) {
            vertexCount += 1;
            colors.push(rVal, gVal, bVal);
            if (vertexCount == 2) {
                x1 = vertices[vertices.length - 4];
                y1 = vertices[vertices.length - 3];
                x2 = vertices[vertices.length - 2];
                y2 = vertices[vertices.length - 1];
                d = Math.min(Math.abs(x1 - x2), Math.abs(y1 - y2));
                if (Math.abs(x1 - x2) > d) {
                    if (x1 > x2) {
                        x2 = x1 - d;
                    } else {
                        x2 = x1 + d;
                    }
                } else if (Math.abs(y1 - y2) > d) {
                    if (y1 > y2) {
                        y2 = y1 - d;
                    } else {
                        y2 = y1 + d;
                    }
                }
                vertices.splice(vertices.length - 2, 2, x1, y2, x2, y2, x2, y1);
                colors.push(rVal, gVal, bVal, rVal, gVal, bVal);
                objects.push({
                    "name": "square",
                    "mode": gl.TRIANGLE_FAN,
                    "off": offset,
                    "count": 4
                });
                offset += 4;
                vertexCount = 0;
            }
        }

        else if (polygonMode == true) {
            vertexCount += 1;
            colors.push(rVal, gVal, bVal);
            if (vertexCount == numVert) {
                objects.push({
                    "name": "polygon",
                    "mode": gl.TRIANGLE_FAN,
                    "off": offset,
                    "count": numVert
                });
                offset += numVert;
                vertexCount = 0;
            }
        }
        draw();
    }
    //console.log(vertices);

});

canvasElem.addEventListener('mousemove', (e) => {
    if (vec != null) {
        vec2 = getMousePosition(canvasElem, e);
        if (cursorMode) {
            let deltaX = vec2[0] - vec[0];
            let deltaY = vec2[1] - vec[1];
            if (selectedObject == -1) {
                vertices = backupVertices.map((it, idx) => idx % 2 == 0 ? it + deltaX : it + deltaY);
            }
            else {
                for (var i = objects[selectedObject].off * 2; i < objects[selectedObject].off * 2 + objects[selectedObject].count * 2; i += 2) {
                    vertices[i] = backupVertices[i] + deltaX;
                    vertices[i + 1] = backupVertices[i + 1] + deltaY;
                }
            }

            draw();
        }
        else if (resizeMode && selectedObject != -1) {
            if (objects[selectedObject].name == "line") {
                let centerX = (backupVertices[objects[selectedObject].off * 2] + backupVertices[objects[selectedObject].off * 2 + 2]) / 2;
                let centerY = (backupVertices[objects[selectedObject].off * 2 + 1] + backupVertices[objects[selectedObject].off * 2 + 3]) / 2;

                let scaleX = (Math.abs(vec2[0] - centerX)) / (Math.abs(vec[0] - centerX));
                let scaleY = (Math.abs(vec2[1] - centerY)) / (Math.abs(vec[1] - centerY));

                var tempVertices = [];
                for (var i = objects[selectedObject].off * 2; i < objects[selectedObject].off * 2 + objects[selectedObject].count * 2; i++) {
                    tempVertices.push(vertices[i]);
                }

                for (var i = 0; i < tempVertices.length; i += 2) {
                    tempVertices[i] -= centerX;
                    tempVertices[i + 1] -= centerY;
                }

                for (var i = 0; i < tempVertices.length; i += 2) {
                    tempVertices[i] = (backupVertices[objects[selectedObject].off * 2 + i] - centerX) * scaleX;
                    tempVertices[i + 1] = (backupVertices[objects[selectedObject].off * 2 + i + 1] - centerY) * scaleY;
                }

                for (var i = 0; i < tempVertices.length; i += 2) {
                    tempVertices[i] += centerX;
                    tempVertices[i + 1] += centerY;
                }

                var j = 0;
                for (var i = objects[selectedObject].off * 2; i < objects[selectedObject].off * 2 + objects[selectedObject].count * 2; i++) {
                    vertices[i] = tempVertices[j];
                    j++;
                }
            }
            else if (objects[selectedObject].name == "square") {

                //let vertexTemp = vertices.slice(objects[selectedObject].offset, objects[selectedObject].offset+8);

                let centerX = (backupVertices[objects[selectedObject].off * 2] + backupVertices[objects[selectedObject].off * 2 + 6]) / 2;
                let centerY = (backupVertices[objects[selectedObject].off * 2 + 1] + backupVertices[objects[selectedObject].off * 2 + 7]) / 2;
                // let centerX = (vertexTemp[0] + vertexTemp[6])/2;
                // let centerY = (vertexTemp[1] + vertexTemp[7])/2;

                let scaleX = (Math.abs(vec2[0] - centerX)) / (Math.abs(vec[0] - centerX));
                let scaleY = (Math.abs(vec2[1] - centerY)) / (Math.abs(vec[1] - centerY));

                var tempVertices = [];
                for (var i = objects[selectedObject].off * 2; i < objects[selectedObject].off * 2 + objects[selectedObject].count; i++) {
                    tempVertices.push(vertices[i]);
                }

                for (var i = 0; i < tempVertices.length; i += 2) {
                    tempVertices[i] -= centerX;
                    tempVertices[i + 1] -= centerY;
                }

                for (var i = 0; i < tempVertices.length; i += 2) {
                    tempVertices[i] = (backupVertices[objects[selectedObject].off * 2 + i] - centerX) * scaleX;
                    tempVertices[i + 1] = (backupVertices[objects[selectedObject].off * 2 + i + 1] - centerY) * scaleY;
                }

                for (var i = 0; i < tempVertices.length; i += 2) {
                    tempVertices[i] += centerX;
                    tempVertices[i + 1] += centerY;
                }

                let deltaX = (tempVertices[2] - tempVertices[0]) * (100 / 48);
                let deltaY = (tempVertices[3] - tempVertices[1]) * 0.48;
                tempVertices.push(tempVertices[0] - deltaY);
                tempVertices.push(tempVertices[1] + deltaX);
                tempVertices.push(tempVertices[2] - deltaY);
                tempVertices.push(tempVertices[3] + deltaX);

                var j = 0;
                for (var i = objects[selectedObject].off * 2; i < objects[selectedObject].off * 2 + objects[selectedObject].count * 2; i++) {
                    vertices[i] = tempVertices[j];
                    j++;
                }


            }
            draw();
        }
    }

});

canvasElem.addEventListener('mouseup', (e) => {
    vec = null;
    backupVertices = null;


});

function updateColor() {
    var color = hexToRgb(document.getElementById("color").value);
    rVal = color.r / 255;
    gVal = color.g / 255;
    bVal = color.b / 255;
}

function jsoning() {
    jsonData.vertices = JSON.stringify(vertices);
    jsonData.objects = JSON.stringify(objects);
    jsonData.colors = JSON.stringify(colors);
    jsonData.offset = JSON.stringify(offset);
    var myvertices = JSON.parse(jsonData.vertices);
    var myobjects = JSON.parse(jsonData.objects);   //loaded vertice
    var mycolors = JSON.parse(jsonData.colors);   //loaded vertice
    var myoffset = JSON.parse(jsonData.offset);   //loaded vertice
    console.log("json: ", jsonData);
    console.log("vertices: ", myvertices);
    console.log("objects: ", myobjects);
    console.log("colors: ", mycolors);
    console.log("offset: ", myoffset);
}

function download(content, fileName, contentType) {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

function saveData() {
    jsoning();
    download(JSON.stringify(jsonData), "attribute_data.json", "text/plain");
}

function loadData() {
    var files = document.getElementById('selectFiles').files;
    console.log(files);
    if (files.length <= 0) {
        return false;
    }

    var fr = new FileReader();
    fr.onload = function (e) {
        console.log("aw");
        var result = JSON.parse(e.target.result);
        vertices = JSON.parse(result.vertices);
        colors = JSON.parse(result.colors);
        objects = JSON.parse(result.objects);
        offset = JSON.parse(result.offset);
        draw();
    }
    fr.readAsText(files.item(0));
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function cursorButton() {
    cursorMode = true;
    resizeMode = false;
    lineMode = false;
    squareMode = false;
    polygonMode = false;
}

function resizeButton() {
    cursorMode = false;
    resizeMode = true;
    lineMode = true;
    squareMode = false;
    polygonMode = false;
}

function lineButton() {
    cursorMode = false;
    resizeMode = false;
    lineMode = true;
    squareMode = false;
    polygonMode = false;
}

function squareButton() {
    cursorMode = false;
    resizeMode = false;
    lineMode = false;
    squareMode = true;
    polygonMode = false;
}

var numVert;

function polygonButton() {
    cursorMode = false;
    resizeMode = false;
    lineMode = false;
    squareMode = false;
    polygonMode = true;

    numVert = Number(prompt("Number of vertices", 5));
}

// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("button-help");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function () {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}