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