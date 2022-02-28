// Init global variables
const toolCreate = document.querySelector('[data-toolCreate]'),
    toolDelete = document.querySelector('[data-toolDelete]'),
    toolMove = document.querySelector('[data-toolMove]'),
    toolSelect = document.querySelector('[data-toolSelect]'),
    tools = document.querySelectorAll('.tool'),
    backdrop = document.querySelector('.builder-backdrop'),
    inputWidth = document.querySelector('input#width'),
    inputHeight = document.querySelector('input#height'),
    inputBorderRadius = document.querySelector('input#borderRadius'),
    inputBackgroundColor = document.querySelector('input#backgroundColor'),
    inputBorderWidth = document.querySelector('input#borderWidth'),
    inputBorderColor = document.querySelector('input#borderColor');

let creatorModule = document.querySelector('[data-creatorModule]');
let shapes = [];
let recentlyDeleted = [];
let holdingShift = false;
let groupId = undefined;

// Init tool activation functions
toolCreate.addEventListener('click', activateCreatorTool);
toolSelect.addEventListener('click', activateSelectTool);

// Hotkey keybinds
window.addEventListener('keydown', (e) => {
    if(e.key == 'Shift') holdShiftKey();
    if(e.key == 'Escape') resetSelection();
    if(e.key == 'Backspace') deleteSelection();
    if(e.key == 'v') activateSelectTool();
    if(e.key == 'c') activateCreatorTool();
});
window.addEventListener('keyup', (e) => {
    if(e.key == 'Shift') stopHoldShiftKey();
});

// Hotkey specific functions
// Defines wether a shift key is being held down
function holdShiftKey(e){
    holdingShift = true;
}
function stopHoldShiftKey(e){
    holdingShift = false;
}
// Removes a selection and clearing group ID
function resetSelection(){
    clearGroup();
}
// Deletes all selected elements
function deleteSelection(){
    document.querySelectorAll('.selected').forEach(element => {
        const shape = shapes.find(shape => shape.id == element.dataset.id);
        shape.delete(element);
    }
)};

// Functions that activates specific tools
function activateCreatorTool(){
    removeAllTools();
    toolCreate.classList.add('active');
    window.addEventListener('mousedown', createShape);
}
function activateSelectTool(){
    removeAllTools();
    toolSelect.classList.add('active');
    window.addEventListener('mousedown', selectShape);
}

// Removing all tools and tool specific styling and variables. Should be called in the beginning of all activation functions above
function removeAllTools(){
    tools.forEach(tool => {
        tool.classList.remove('active');
    });
    if(document.querySelectorAll('[data-group]').length == 1){
        clearGroup();
        groupId = undefined;
    }
    window.removeEventListener('mousedown', createShape);
    window.removeEventListener('mousedown', selectShape);
}

// Input verification
// Select the whole value when input is in focus
document.querySelectorAll('.creator input').forEach(input => {
    input.addEventListener('focusin', () =>{
        input.select();
    });
});
// Added an event that verifies the user input in the Creator sidebar module
document.querySelectorAll('[data-creatorModule] input').forEach(input => {
    input.addEventListener('input', () => {
        // Specific verification for inputs that should only contain numbers 
        if(input.hasAttribute('data-onlyNumber')){
            input.addEventListener('input', () =>{
                // Only numbers allowed
                input.value = input.value.replace(/[^0-9]/g, "");
                // Replace 0 if value starts with 0 and is has 2 or more characters
                if(input.value.match(/^0/) && input.value.length >= 2) input.value = input.value.replace(/^0/, '');
            });
        }
        // Specific verification for inputs that should only contain colors in HEX
        if(input.hasAttribute('data-onlyNumber')){
            input.addEventListener('input', () =>{
                // Transform value to lower case and don't allow invalid HEX code characters 
                input.value = input.value.toLowerCase();
                input.value = input.value.replace(/[^0-9a-f]/g, '');
            });
        }
        console.log('Typing...');
    });
    // Added final verification check when you leave an input
    input.addEventListener('focusout', () => {
        console.log('Left - ' + input);
        verifyInputs();
    });
});

// Makes sure that inputs are not empty and that they contain a valid value
function verifyInputs(){
    document.querySelectorAll('[data-onlyNumber]').forEach(input => {
        console.log('Verify Numbers');
        // If empty set value to 0
        if(input.value == '') input.value = '0';
    });
    document.querySelectorAll('[data-onlyHex]').forEach(input => {
        console.log('Verify Colors');
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

// Local storage
// If there are items in the shapes array, recreate all of them
if(JSON.parse(localStorage.getItem('shapes')) != null){
    let storageShapes = JSON.parse(localStorage.getItem('shapes'));
    storageShapes.forEach(obj => {
        const shape = new Shape(obj.width, obj.height, obj.borderRadius, obj.top, obj.left, obj.borderWidth, obj.borderColor, obj.backgroundColor, obj.id);
        shapes.push(shape);
        shape.create();
    });
}

// Creating the shape based on the user inputs and click position
// Now also supports 'drag to create', so the user can drag a shape that will still get the same color, radius and border as selected
// Needs comments and a bit for cleaning
function createShape(e){
    if(e.target.closest('.builder-backdrop') || e.target.closest('.shape')){
        // Calling this to make sure that all inputs have a valid value
        verifyInputs();
        // Init the 'drag to create' events
        window.addEventListener('mousemove', startDragCreator);
        window.addEventListener('mouseup', stopDragCreator);
        // Getting all values from the inputs in the Creator module
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
        // Getting the preview element ready
        let previewShape = document.createElement('div');
        previewShape.style.top = `${valueY}px`;
        previewShape.style.left = `${valueX}px`;
        previewShape.style.background = `#${shapeBackgroundColor}`;
        previewShape.style.border = `${shapeBorderWidth}px #${shapeBorderColor} solid`;
        previewShape.style.borderRadius = `${shapeBorderRadius}px`;
        previewShape.classList.add('preview-shape');
        // If user drags the mouse instead of clicking, the preview element will appear at the mouse position and change it's size based on where the mouse is compared to the beginning
        function startDragCreator(e){
            // Checking if the mouse postion is more or less from where is started and defining the 
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
            // updating preview element width and height
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

// Single select, multiselect, deselect, drag, multi drag mega function.
// Needs comments and a bit of cleaning up
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
                    if(element.classList.contains('selected') && holdingShift == true){
                        removeFromGroup(element);
                    }else{
                        addToGroup(element);
                    }
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
// Key learning here is: 
// How to get characters using charCodes
// Added two arrays together with the .concat() method
// Getting a variable value based of the result from a callback function
// Adding extra characters on specific iteration of a for loop
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