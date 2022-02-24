// Init global variables
const toolCreate = document.querySelector('[data-toolCreate]');
const toolDelete = document.querySelector('[data-toolDelete]');
const toolMove = document.querySelector('[data-toolMove]');
const toolSelect = document.querySelector('[data-toolSelect]');
const backdrop = document.querySelector('.builder-backdrop');

let creatorModule = document.querySelector('[data-creatorModule]');

let shapes = [];
let holdingShift = false;
let holdingControl = false;
let groupId = undefined;

// Init tool activation functions
toolCreate.addEventListener('click', activateCreatorTool);
toolMove.addEventListener('click', activateMoveTool);
toolDelete.addEventListener('click', activateDeleteTool);
toolSelect.addEventListener('click', activateSelectTool);

window.addEventListener('keydown', (e) => {
    if(e.key == 'Shift') holdShiftKey();
    if(e.key == 'Meta') holdControlKey();
    if(e.key == 'Escape') reset();
    if(e.key == 'm') activateMoveTool();
    if(e.key == 'v') activateSelectTool();
    if(e.key == 'c') activateCreatorTool();
    if(e.key == 'x') activateDeleteTool();
});
window.addEventListener('keyup', (e) => {
    if(e.key == 'Shift') stopHoldShiftKey();
    if(e.key == 'Meta') stopHoldControlKey();
});

function holdShiftKey(e){
    holdingShift = true;
}
function stopHoldShiftKey(e){
    holdingShift = false;
}
function holdControlKey(e){
    holdingControl = true;
}
function stopHoldControlKey(e){
    holdingControl = false;
}
function reset(){
    clearGroup();
    groupId = undefined;
}

// Every function deactivates the other tools
function activateCreatorTool(){
    removeAllTools();
    creatorModule.style.display = 'block';
    window.addEventListener('click', createShape);
}
function activateMoveTool(){
    removeAllTools();
    backdrop.style.cursor = 'grab';
    document.querySelectorAll('.dragable').forEach(element => {
        element.style.cursor = 'grab';
    });
    window.addEventListener('mousedown', dragElement);
}
function activateDeleteTool(){
    removeAllTools();
    window.addEventListener('click', deleteElement);
}
function activateSelectTool(){
    removeAllTools();
    window.addEventListener('mousedown', selectShape);
}
function removeAllTools(){
    creatorModule.style.display = 'none';
    document.querySelectorAll('.dragable').forEach(element => {
        element.style.cursor = 'auto';
    });
    if(document.querySelectorAll('[data-group]').length == 1){
        clearGroup();
        groupId = undefined;
    }
    backdrop.style.cursor = 'auto';
    window.removeEventListener('click', deleteElement);
    window.removeEventListener('click', createShape);
    window.removeEventListener('mousedown', selectShape);
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

// Check local storage and create elements 
if(JSON.parse(localStorage.getItem('shapes')) != null){
    let storageShapes = JSON.parse(localStorage.getItem('shapes'));
    storageShapes.forEach(obj => {
        const shape = new Shape(obj.width, obj.height, obj.radius, obj.top, obj.left, obj.borderWidth, obj.borderColor, obj.color, obj.id);
        shapes.push(shape);
        shape.createShape();
    });
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
        const shape = new Shape(shapeWidth, shapeHeight, shapeRadius, topPos, leftPos, shapeBorderWidth, shapeBorderColor, shapeColor, shapeId);
        shape.createShape();
        shapes.push(shape);
        localStorage.setItem('shapes', JSON.stringify(shapes));
    }
}

// Function that will remove a shape from the DOM and local storage when clicked on.
function deleteElement(e){
    if(e.target.closest('.shape')){
        console.log(e.target)
        // Find the specific element that was clicked, and remove it from the array
        const currentShape = shapes.find(shape => shape.id == e.target.dataset.id);
        currentShape.deleteShape(e, currentShape);
    }
}

// Function that allows elements with the call 'dragable', to be dragged with the mouse
function dragElement(e){
    if(e.target.closest('.dragable')){
        // Getting mouse position
        const heightPos = e.clientY;
        const widthPos = e.clientX;
        let element = e.target.closest('.dragable');
        element.style.cursor = 'grabbing';
        if(groupId != undefined && e.target.hasAttribute('data-group')){
            let groupContainer = document.createElement('div');        
            groupContainer.style.position = `fixed`;
            groupContainer.style.zIndex = `50`;
            groupContainer.style.width = `100vw`;
            groupContainer.style.height = `100vh`;
            groupContainer.style.top = `0px`;
            groupContainer.style.left = `0px`;
            groupContainer.classList.add('group-container');
            document.body.append(groupContainer);
            document.querySelectorAll('[data-group]').forEach(shape => {
                groupContainer.append(shape);
            });
            element = e.target.closest('.group-container');
        }
        // Defining element center current position
        let elementTopPos = heightPos - element.offsetTop;
        let elementLeftPos = widthPos - element.offsetLeft;
        element.style.cursor = 'grabbing';
        window.addEventListener('mousemove', startDragElement);
        window.addEventListener('mouseup', stopDragElement);
        if(groupId == undefined && document.querySelector('.group-container'))document.body.append(element);
        function startDragElement(e){
            // Setting now element position compared to mouse movement
            element.style.top = (e.clientY - elementTopPos) + 'px';
            element.style.left = (e.clientX - elementLeftPos) + 'px';
        };
        // When dragging stops, set element attributes and save to local storage
        function stopDragElement(){
            // Find the element that was dragged and change the object
            if(!element.hasAttribute('data-group') && !document.querySelector('.group-container')){
            let currentShape = shapes.find(shape => shape.id == element.dataset.id);
            currentShape.top = element.offsetTop;
            currentShape.left = element.offsetLeft;
            localStorage.setItem('shapes', JSON.stringify(shapes));
            element.style.cursor = 'grab';
            }
            if(groupId != undefined && e.target.hasAttribute('data-group')){
                document.querySelectorAll('[data-group]').forEach(groupElement => {
                    let currentShape = shapes.find(shape => shape.id == groupElement.dataset.id);
                    document.body.append(groupElement);
                    groupElement.style.cursor = 'grab';
                    groupElement.style.top = `${element.offsetTop + groupElement.offsetTop}px`;
                    groupElement.style.left = `${element.offsetLeft + groupElement.offsetLeft}px`;
                    currentShape.top = groupElement.offsetTop;
                    currentShape.left = groupElement.offsetLeft;
                });
                localStorage.setItem('shapes', JSON.stringify(shapes));
                element.remove();
            }
            window.removeEventListener('mousemove', startDragElement);
            window.removeEventListener('mouseup', stopDragElement);
        };
    }
}

// Function that allows to select one or more elements
function selectShape(e){
    window.addEventListener('mousemove', startGroupSelection);
    window.addEventListener('mouseup', stopGroupSelection);
    const heightPos = e.clientY;
    const widthPos = e.clientX;
    let selectionArea = document.createElement('div');
    selectionArea.style.zIndex = `50`; 
    selectionArea.style.top = `${heightPos}px`;
    selectionArea.style.left = `${widthPos}px`;
    selectionArea.classList.add('selection-area');
    selectionArea.style.transform = 'scale(-1, 1)';
    function startGroupSelection(e){
        if(e.clientX - widthPos > 0){
            selectionArea.style.left = `${widthPos}px`;
            selectionArea.style.right = `unset`;
        }else{
            selectionArea.style.left = `unset`;
            selectionArea.style.right = `${(window.innerWidth - widthPos)}px`;
        }
        if(e.clientY - heightPos > 0){
            selectionArea.style.top = `${heightPos}px`;
            selectionArea.style.bottom = `unset`;
        }else{
            selectionArea.style.top = `unset`;
            selectionArea.style.bottom = `${(window.innerHeight - heightPos)}px`;
        }
        selectionArea.style.width = `${Math.abs(e.clientX - widthPos)}px`;
        selectionArea.style.height = `${Math.abs(e.clientY - heightPos)}px`;
        document.body.append(selectionArea);
    }
    function stopGroupSelection(){
        if(groupId == undefined){
            groupId = generateGroupId();
        }
        document.querySelectorAll('.dragable').forEach(element => {
            if((element.offsetLeft + element.offsetWidth) >= selectionArea.offsetLeft && element.offsetLeft <= (selectionArea.offsetLeft + selectionArea.offsetWidth) && (element.offsetTop + element.offsetHeight) >= selectionArea.offsetTop && element.offsetTop <= (selectionArea.offsetTop + selectionArea.offsetHeight)){
                element.style.outline = '#4381d1 solid 3px';
                element.dataset.group = groupId;
            }
        });
        selectionArea.remove();
        window.removeEventListener('mousemove', startGroupSelection);
        window.removeEventListener('mouseup', stopGroupSelection);
    }
    if(e.target.closest('.shape')){
        if(holdingShift == false && holdingControl == false){
            clearGroup();
            groupId = generateGroupId();
        }
        if(holdingControl == true){
            e.target.style.outline = 'none';
            e.target.dataset.group = groupId;
            e.target.removeAttribute('data-group');
        }else{
            e.target.style.outline = '#4381d1 solid 3px';
            e.target.dataset.group = groupId;
        }
        
    }
    if(e.target.classList.contains('builder-backdrop') && holdingShift == false){
        clearGroup();
        groupId = undefined;
    }
}
function clearGroup(){
    document.querySelectorAll('.dragable').forEach(element => {
        element.style.outline = 'none';
        element.removeAttribute('data-group');
    });
}

// Function that generates a random ID based with a '-' every 6 charracter
// Should experiment with export/import
function generateGroupId(){
    const groupIdCharCodes = [];
    const groupIdLength = 24;
    function arrayFromLowToHigh(low, high){
        const array = []
        for(let i = low; i <= high; i++){
            array.push(i);
        }
        return array;
    }
    const GROUP_ID_CHAR_CODES = arrayFromLowToHigh(48, 57).concat(arrayFromLowToHigh(65, 90)).concat(arrayFromLowToHigh(97, 122));
    for(let i = 0; i < groupIdLength; i++){
        const randomCharCode = GROUP_ID_CHAR_CODES[Math.floor(Math.random() * GROUP_ID_CHAR_CODES.length)];
        if (i && (i % 6 == 0)) groupIdCharCodes.push('-');
        groupIdCharCodes.push(String.fromCharCode(randomCharCode));
    }
    return groupIdCharCodes.join('');
}