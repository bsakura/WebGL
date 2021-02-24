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
setUpBuffer();

canvasElem.addEventListener('mousedown', (e) => {
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
            colors.push(1, 0, 0);
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
            if (vertexCount == numVert) {
                vertices.splice(vertices.length - 2, 1);
                colors.push(0, 0, 1);
                vertices.push(vec[0]);
                vertices.push(vec[1]);
                colors.push(0, 0, 1);
                vertices.push(vec[0]);
                vertices.push(vertices[vertices.length - 6]);
                colors.push(0, 0, 1);
                objects.push({
                    "name": "square",
                    "mode": gl.TRIANGLE_FAN,
                    "off": offset,
                    "count": 4
                });
                offset += 4;
                vertexCount = 0;
            } else {
                colors.push(0, 0, 1);
                vertices.push(vec[0]);
            }
        }

        else if (polygonMode == true) {
            vertexCount += 1;
            colors.push(0, 0, 1);
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