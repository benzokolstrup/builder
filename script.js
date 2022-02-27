// Init global variables
const toolCreate = document.querySelector('[data-toolCreate]');
const toolDelete = document.querySelector('[data-toolDelete]');
const toolMove = document.querySelector('[data-toolMove]');
const toolSelect = document.querySelector('[data-toolSelect]');
const tools = document.querySelectorAll('.tool');

const backdrop = document.querySelector('.builder-backdrop');

const inputWidth = document.querySelector('input#width');
const inputHeight = document.querySelector('input#height');
const inputBorderRadius = document.querySelector('input#borderRadius');
const inputBackgroundColor = document.querySelector('input#backgroundColor');
const inputBorderWidth = document.querySelector('input#borderWidth');
const inputBorderColor = document.querySelector('input#borderColor');

let creatorModule = document.querySelector('[data-creatorModule]');

let shapes = [];
let holdingShift = false;
let groupId = undefined;

// Init tool activation functions
toolCreate.addEventListener('click', activateCreatorTool);
toolDelete.addEventListener('click', activateDeleteTool);
toolSelect.addEventListener('click', activateSelectTool);

window.addEventListener('keydown', (e) => {
    if(e.key == 'Shift') holdShiftKey();
    if(e.key == 'Escape') reset();
    if(e.key == 'v') activateSelectTool();
    if(e.key == 'c') activateCreatorTool();
    if(e.key == 'x') activateDeleteTool();
});
window.addEventListener('keyup', (e) => {
    if(e.key == 'Shift') stopHoldShiftKey();
});

function holdShiftKey(e){
    holdingShift = true;
}
function stopHoldShiftKey(e){
    holdingShift = false;
}
function reset(){
    clearGroup();
    groupId = undefined;
}

// Every function deactivates the other tools
function activateCreatorTool(){
    removeAllTools();
    toolCreate.classList.add('active');
    window.addEventListener('mousedown', createShape);
}
function activateDeleteTool(){
    removeAllTools();
    toolDelete.classList.add('active');
    window.addEventListener('mousedown', deleteElement);
}
function activateSelectTool(){
    removeAllTools();
    toolSelect.classList.add('active');
    window.addEventListener('mousedown', selectShape);
}
function removeAllTools(){
    tools.forEach(tool => {
        tool.classList.remove('active');
    });
    if(document.querySelectorAll('[data-group]').length == 1){
        clearGroup();
        groupId = undefined;
    }
    window.removeEventListener('mousedown', deleteElement);
    window.removeEventListener('mousedown', createShape);
    window.removeEventListener('mousedown', selectShape);
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
        verifyInputs();
    });
});

function verifyInputs(){
    document.querySelectorAll('[data-onlyHex]').forEach(input => {
        // If input is 0 set it to a default
        if(input.value.length == 0) input.value = 'efefef';
        // If the value only has same characters, fill the value with that character. Example: ff = ffffff
        if(input.value.split('').every((char, i, hexArray) => char === hexArray[0])) input.value = input.value.split('')[0].repeat(6);
        // If the value has 2 characters, print those 3 times. Example: fe = fefefe
        if(input.value.length == 2) input.value = input.value.repeat(3);
        // If the input has 3 characters, add 2 of every character. Example: 4ad = 44aadd
        if(input.value.length >= 3 && input.value.length < 6) input.value = input.value.replace(/([0-9a-f])([0-9a-f])([0-9a-f]).*/,'$1$1$2$2$3$3');
    }
)};

// Check local storage and create elements 
if(JSON.parse(localStorage.getItem('shapes')) != null){
    let storageShapes = JSON.parse(localStorage.getItem('shapes'));
    storageShapes.forEach(obj => {
        const shape = new Shape(obj.width, obj.height, obj.borderRadius, obj.top, obj.left, obj.borderWidth, obj.borderColor, obj.backgroundColor, obj.id);
        shapes.push(shape);
        shape.create();
    });
}

// Function that is creating the shape based on the user inputs and click position
function createShape(e){
    if(e.target.closest('.builder-backdrop') || e.target.closest('.shape')){
        verifyInputs();
        window.addEventListener('mousemove', startDragCreator);
        window.addEventListener('mouseup', stopDragCreator);
        let shapeWidth = inputWidth.value;
        let shapeHeight = inputHeight.value;
        const shapeBorderRadius = inputBorderRadius.value;
        const shapeBackgroundColor = inputBackgroundColor.value;
        const shapeBorderWidth = inputBorderWidth.value;
        const shapeBorderColor = inputBorderColor.value;
        const shapeId = Date.now();
        const valueY = e.clientY;
        const valueX = e.clientX;
        let topPos = valueY - (shapeHeight / 2);
        let leftPos = valueX - (shapeWidth / 2);
        let previewShape = document.createElement('div');
        previewShape.style.top = `${valueY}px`;
        previewShape.style.left = `${valueX}px`;
        previewShape.style.background = `#${shapeBackgroundColor}`;
        previewShape.style.border = `${shapeBorderWidth}px #${shapeBorderColor} solid`;
        previewShape.style.borderRadius = `${shapeBorderRadius}px`;
        previewShape.classList.add('preview-shape');
        function startDragCreator(e){
            if(e.clientX - valueX > 0){
                previewShape.style.left = `${valueX}px`;
                previewShape.style.removeProperty('right');
            }else{
                previewShape.style.removeProperty('left');
                previewShape.style.right = `${(window.innerWidth - valueX)}px`;
            }
            if(e.clientY - valueY > 0){
                previewShape.style.top = `${valueY}px`;
                previewShape.style.removeProperty('bottom');
            }else{
                previewShape.style.removeProperty('top');
                previewShape.style.bottom = `${(window.innerHeight - valueY)}px`;
            }
            previewShape.style.width = `${Math.abs(e.clientX - valueX)}px`;
            previewShape.style.height = `${Math.abs(e.clientY - valueY)}px`;
            document.body.append(previewShape);
        }
        function stopDragCreator(){
            if(document.body.contains(previewShape)){
                shapeWidth = previewShape.offsetWidth - (shapeBorderWidth * 2);
                shapeHeight = previewShape.offsetHeight - (shapeBorderWidth * 2);
                topPos = previewShape.offsetTop;
                leftPos = previewShape.offsetLeft;
            }
            previewShape.remove();
            window.removeEventListener('mousemove', startDragCreator);
            window.removeEventListener('mouseup', stopDragCreator);
            if(shapeWidth <= 0 || shapeHeight <= 0) return;
            inputWidth.value = shapeWidth;
            inputHeight.value = shapeHeight;
            inputBorderRadius.value = shapeBorderRadius;
            inputBackgroundColor.value = shapeBackgroundColor;
            inputBorderWidth.value = shapeBorderWidth;
            inputBorderColor.value = shapeBorderColor;
            const shape = new Shape(shapeWidth, shapeHeight, shapeBorderRadius, topPos, leftPos, shapeBorderWidth, shapeBorderColor, shapeBackgroundColor, shapeId);
            shapes.push(shape);
            shape.create();
            localStorage.setItem('shapes', JSON.stringify(shapes));
        }
    }
}

// Function that will remove a shape from the DOM and local storage when clicked on.
function deleteElement(e){
    if(e.target.closest('.shape')){
        const shape = shapes.find(shape => shape.id == e.target.dataset.id);
        shape.delete(e);
    }
}



// Function that allows to select one or more elements
function selectShape(e){
    const valueY = e.clientY;
    const valueX = e.clientX;
    if(e.target.closest('.selected') && holdingShift == true){
        removeFromGroup(e.target);
        return;
    }
    if(e.target.closest('.shape') && !e.target.closest('.selected')){
        if(holdingShift == false){
            clearGroup();
            groupId = generateGroupId();
        }
        addToGroup(e.target);
    }
    if(e.target.classList.contains('builder-backdrop')){
        if(holdingShift == false) clearGroup(e);
        window.addEventListener('mousemove', startGroupSelection);
        window.addEventListener('mouseup', stopGroupSelection);
        let selectionArea = document.createElement('div');
        selectionArea.style.top = `${valueY}px`;
        selectionArea.style.left = `${valueX}px`;
        selectionArea.classList.add('selection-area');
        function startGroupSelection(e){
            if(e.clientX - valueX > 0){
                selectionArea.style.left = `${valueX}px`;
                selectionArea.style.right = `unset`;
            }else{
                selectionArea.style.left = `unset`;
                selectionArea.style.right = `${(window.innerWidth - valueX)}px`;
            }
            if(e.clientY - valueY > 0){
                selectionArea.style.top = `${valueY}px`;
                selectionArea.style.bottom = `unset`;
            }else{
                selectionArea.style.top = `unset`;
                selectionArea.style.bottom = `${(window.innerHeight - valueY)}px`;
            }
            selectionArea.style.width = `${Math.abs(e.clientX - valueX)}px`;
            selectionArea.style.height = `${Math.abs(e.clientY - valueY)}px`;
            document.body.append(selectionArea);
        }
        function stopGroupSelection(){
            if(groupId == undefined) groupId = generateGroupId();
            document.querySelectorAll('.shape').forEach(element => {
                if((element.offsetLeft + element.offsetWidth) >= selectionArea.offsetLeft && element.offsetLeft <= (selectionArea.offsetLeft + selectionArea.offsetWidth) && (element.offsetTop + element.offsetHeight) >= selectionArea.offsetTop && element.offsetTop <= (selectionArea.offsetTop + selectionArea.offsetHeight)){
                    addToGroup(element);
                }
            });
            selectionArea.remove();
            window.removeEventListener('mousemove', startGroupSelection);
            window.removeEventListener('mouseup', stopGroupSelection);
        }
    }
    if(e.target.closest('.selected') && holdingShift == false){
        // Getting mouse position
        let dragContainer = document.createElement('div');
        dragContainer.classList.add('drag-container');
        document.body.append(dragContainer);
        document.querySelectorAll('[data-group]').forEach(shape => {
            dragContainer.append(shape);
        });
        let element = e.target.closest('.drag-container');
        // Defining element center current position
        let elementTopPos = valueY - element.offsetTop;
        let elementLeftPos = valueX - element.offsetLeft;
        window.addEventListener('mousemove', startDragElement);
        window.addEventListener('mouseup', stopDragElement);
        function startDragElement(e){
            // Setting now element position compared to mouse movement
            element.style.top = (e.clientY - elementTopPos) + 'px';
            element.style.left = (e.clientX - elementLeftPos) + 'px';
        };
        // When dragging stops, set element attributes and save to local storage
        function stopDragElement(){
            if(groupId != undefined && e.target.hasAttribute('data-group')){
                document.querySelectorAll('[data-group]').forEach(groupElement => {
                    let currentShape = shapes.find(shape => shape.id == groupElement.dataset.id);
                    document.body.append(groupElement);
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
function addToGroup(e){
    const shape = shapes.find(shape => shape.id == e.dataset.id);
    shape.select(e); 
}
function removeFromGroup(e){
    const shape = shapes.find(shape => shape.id == e.dataset.id);
    shape.deSelect(e);
}
function clearGroup(){
    groupId = undefined;
    document.querySelectorAll('.selected').forEach(element => {
        removeFromGroup(element);
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