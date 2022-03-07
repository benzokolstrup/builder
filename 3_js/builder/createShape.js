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