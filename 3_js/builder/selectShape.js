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
            groupId = generateId();
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
            if(groupId == undefined) groupId = generateId();
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