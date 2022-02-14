// Init global variables
const toolCreate = document.querySelector('[data-toolCreate]');
const toolDelete = document.querySelector('[data-toolDelete]');
const toolMove = document.querySelector('[data-toolMove]');
const toolSelect = document.querySelector('[data-toolSelect]');

let creatorModule = document.querySelector('[data-creatorModule]');
let shapes = [];

// Init tool activation functions
toolCreate.addEventListener('click', activateCreatorTool);
toolMove.addEventListener('click', activateMoveTool);
toolDelete.addEventListener('click', activateDeleteTool);
toolSelect.addEventListener('click', activateSelectTool);

window.addEventListener('keydown', (e) => {
    if(e.key == 'v') activateMoveTool();
    if(e.key == 'c') activateCreatorTool();
    if(e.key == 'x') activateDeleteTool();
});

// Every function deactivates the other tools
function activateCreatorTool(){
    creatorModule.style.display = 'block';
    document.querySelectorAll('.dragable').forEach(element => {
        element.style.cursor = 'auto';
    });
    window.addEventListener('click', createShape);
    window.removeEventListener('mousedown', dragElement);
    window.removeEventListener('mousedown', deleteElement);
    window.removeEventListener('click', selectShape);
}
function activateMoveTool(){
    creatorModule.style.display = 'none';
    document.querySelectorAll('.dragable').forEach(element => {
        element.style.cursor = 'grab';
    });
    window.addEventListener('mousedown', dragElement);
    window.removeEventListener('click', createShape);
    window.removeEventListener('mousedown', deleteElement);
    window.removeEventListener('click', selectShape);
}
function activateDeleteTool(){
    creatorModule.style.display = 'none';
    document.querySelectorAll('.dragable').forEach(element => {
        element.style.cursor = 'auto';
    });
    window.addEventListener('mousedown', deleteElement);
    window.removeEventListener('click', createShape);
    window.removeEventListener('mousedown', dragElement);
    window.removeEventListener('click', selectShape);
}
function activateSelectTool(){
    creatorModule.style.display = 'none';
    document.querySelectorAll('.dragable').forEach(element => {
        element.style.cursor = 'auto';
    });
    window.addEventListener('click', selectShape);
    window.removeEventListener('mousedown', deleteElement);
    window.removeEventListener('click', createShape);
    window.removeEventListener('mousedown', dragElement);
}

// Input verification
document.querySelectorAll('.creator input').forEach(input => {
    input.addEventListener('focusin', () =>{
        input.select();
    });
});

// Width/Height/Number input verification
document.querySelectorAll('[data-onlyNumber]').forEach(input => {
    input.addEventListener('input', () =>{
        // Only numbers allowed
        input.value = input.value.replace(/[^0-9]/g, "");
        // Replace 0 if value starts with 0 and is has 2 or more characters
        if(input.value.match(/^0/) && input.value.length >= 2) input.value = input.value.replace(/^0/, '');
    });
    input.addEventListener('focusout', () => {
        // If empty set value to 0
        if(input.value == '') input.value = '0';
    });
});

// Color/HEX input verification
document.querySelectorAll('[data-onlyHex]').forEach(input => {
    input.addEventListener('input', () =>{
        // Transform value to lower case and don't allow invalid HEX code characters 
        input.value = input.value.toLowerCase();
        input.value = input.value.replace(/[^0-9a-f]/g, '');
    });
    input.addEventListener('focusout', () => {
        // If input is 0 set it to a default
        if(input.value.length == 0) input.value = 'efefef';
        // If the value only has same characters, fill the value with that character. Example: ff = ffffff
        if(input.value.split('').every((char, i, hexArray) => char === hexArray[0])) input.value = input.value.split('')[0].repeat(6);
        // If the value has 2 characters, print those 3 times. Example: fe = fefefe
        if(input.value.length == 2) input.value = input.value.repeat(3);
        // If the input has 3 characters, add 2 of every character. Example: 4ad = 44aadd
        if(input.value.length >= 3 && input.value.length < 6) input.value = input.value.replace(/([0-9a-f])([0-9a-f])([0-9a-f]).*/,'$1$1$2$2$3$3');
    });
});

// Function that allows to select one or more shapes
function selectShape(e){
    if(e.target.closest('.shape')){
        e.target.style.outline = '#4381d1 solid 3px';
    }
}

// Function that allows elements with the call 'dragable', to be dragged with the mouse
function dragElement(e){
    if(e.target.closest('.dragable')){
        // Getting mouse position
        const heightPos = e.clientY;
        const widthPos = e.clientX;
        let element = e.target.closest('.dragable');
        // Defining element center current position
        let elementTopPos = heightPos - element.offsetTop;
        let elementLeftPos = widthPos - element.offsetLeft;
        element.style.cursor = 'grabbing';
        window.addEventListener('mousemove', startDragElement);
        window.addEventListener('mouseup', stopDragElement);
        document.body.append(element);
        function startDragElement(e){
            // Setting now element position compared to mouse movement
            element.style.top = (e.clientY - elementTopPos) + 'px';
            element.style.left = (e.clientX - elementLeftPos) + 'px';
        };
        // When dragging stops, set element attributes and save to local storage
        function stopDragElement(){
            // Find the element that was dragged and change the object
            let currentShape = shapes.find(shape => shape.id == element.dataset.id);
            currentShape.top = parseInt(element.style.top);
            currentShape.left = parseInt(element.style.left);
            localStorage.setItem('shapes', JSON.stringify(shapes));
            element.style.cursor = 'grab';
            window.removeEventListener('mousemove', startDragElement);
            window.removeEventListener('mouseup', stopDragElement);
        };
    }
}

// Function that is creating the shape based on the user inputs and click position
function createShape(e){
    if(e.target.closest('.builder-backdrop') || e.target.closest('.shape')){
        // Getting all variables needed to create the shape
        const shapeWidth = document.querySelector('input#width').value;
        const shapeHeight = document.querySelector('input#height').value;
        const shapeRadius = document.querySelector('input#radius').value;
        // Stop if width or height is 0
        if(shapeWidth <= 0 || shapeHeight <= 0) return;
        const shapeColor = document.querySelector('input#color').value;
        const shapeBorderWidth = document.querySelector('input#borderWidth').value;
        const shapeBorderColor = document.querySelector('input#borderColor').value;
        const topPos = e.clientY - (shapeHeight / 2);
        const leftPos = e.clientX - (shapeWidth / 2);
        const shapeId = Date.now();

        // Creating object, adding it to an array and adding to local storage
        const shape = new Shape(shapeWidth, shapeHeight, shapeRadius, topPos, leftPos, shapeColor, shapeId);
        shapes.push(shape);
        localStorage.setItem('shapes', JSON.stringify(shapes));

        // Creating element based on the variables and appending to body
        let newShape = document.createElement('div');
        newShape.dataset.id = shapeId;
        newShape.style.position = `absolute`;
        newShape.style.width = `${shapeWidth}px`;
        newShape.style.height = `${shapeHeight}px`;
        newShape.style.borderRadius = `${shapeRadius}px`;
        // Don't set border i width is 0
        if(shapeBorderWidth != 0 || shapeBorderWidth > 0) newShape.style.border = `${shapeBorderWidth}px #${shapeBorderColor} solid`;
        newShape.style.top = `${topPos}px`;
        newShape.style.left = `${leftPos}px`;
        newShape.style.backgroundColor = '#' + shapeColor;
        newShape.classList.add('shape', 'dragable');
        document.body.append(newShape);
    }
}

// Function that will remove a shape from the DOM and local storage when clicked on.
function deleteElement(e){
    if(e.target.closest('.shape')){
        // Find the specific element that was clicked, and remove it from the array
        const currentShape = shapes.find(shape => shape.id == e.target.dataset.id);
        const index = shapes.indexOf(currentShape);
        if (index > -1) {
            shapes.splice(index, 1);
        }
        e.target.remove();
        // If shapes array is empty when an element is removed, then also remove it from local storage
        if(shapes.length == 0){
            localStorage.removeItem('shapes');
        }else{
            localStorage.setItem('shapes', JSON.stringify(shapes));
        }
    }
}