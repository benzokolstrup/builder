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

window.addEventListener('load', () => {
    activateSelectTool();
});
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