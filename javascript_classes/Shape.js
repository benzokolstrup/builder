// Shape class and contructor

class Shape {
    constructor(width, height, borderRadius, top, left, borderWidth, borderColor, backgroundColor, id){
        this.width = width;
        this.height = height;
        this.borderRadius = borderRadius;
        this.top = top;
        this.left = left;
        this.borderWidth = borderWidth;
        this.borderColor = borderColor;
        this.backgroundColor = backgroundColor;
        this.id = id;
    }
    create(){
        let shape = document.createElement('div');        
        shape.dataset.id = this.id;
        shape.style.position = `absolute`;
        shape.style.width = `${this.width}px`;
        shape.style.height = `${this.height}px`;
        shape.style.borderRadius = `${this.borderRadius}px`;
        // Don't set border i width is 0
        if(this.borderWidth != 0 || this.borderWidth > 0) shape.style.border = `${this.borderWidth}px #${this.borderColor} solid`;
        shape.style.top = `${this.top}px`;
        shape.style.left = `${this.left}px`;
        shape.style.backgroundColor = `#${this.backgroundColor}`;
        shape.classList.add('shape', 'dragable');
        document.body.append(shape);
    }
    delete(e){
        const index = shapes.indexOf(this);
        if (index > -1) shapes.splice(index, 1);
        e.remove();
        if(shapes.length == 0){
            localStorage.removeItem('shapes');
        }else{
            localStorage.setItem('shapes', JSON.stringify(shapes));
        }
    }
    select(e){
        e.classList.add('selected');
        e.dataset.group = groupId;
    }
    deSelect(e){
        e.classList.remove('selected')
        e.removeAttribute('data-group');
    }
    updatePostion(e){
       
    }
    
}