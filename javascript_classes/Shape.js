// Init classes
/*
    Classes future ideas
    - Textfield
*/
class Shape {
    constructor(width, height, radius, top, left, borderWidth, borderColor, color, id){
        this.width = width;
        this.height = height;
        this.radius = radius;
        this.top = top;
        this.left = left;
        this.borderWidth = borderWidth;
        this.borderColor = borderColor;
        this.color = color;
        this.id = id;
    }
    createShape(){
        let shape = document.createElement('div');        
        shape.dataset.id = this.id;
        shape.style.position = `absolute`;
        shape.style.width = `${this.width}px`;
        shape.style.height = `${this.height}px`;
        shape.style.borderRadius = `${this.radius}px`;
        // Don't set border i width is 0
        if(this.borderWidth != 0 || this.borderWidth > 0) shape.style.border = `${this.borderWidth}px #${this.borderColor} solid`;
        shape.style.top = `${this.top}px`;
        shape.style.left = `${this.left}px`;
        shape.style.backgroundColor = `#${this.color}`;
        shape.classList.add('shape', 'dragable');
        document.body.append(shape);
    }
}