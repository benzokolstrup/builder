let shapes = [];
class Cube {
	constructor(top, left, id, color, shape) {
		this.top = top;
		this.left = left;
		this.id = id;
		this.color = color;
		this.shape = shape;
	}
}
if(localStorage.getItem('shapes') == null) {
	console.log('Nothing to load');
} else {
	console.log('Welcome back!');
	shapes = JSON.parse(localStorage.getItem('shapes'));
	const loadedCubes = localStorage.getItem('shapes');
	shapes.forEach(obj => {
		loadCubes(obj.top, obj.left, obj.id, obj.color, obj.shape)
	});
}

window.addEventListener('mousedown', (e) => {
	if(e.target.closest('.dragable')) {
		dragElement(e.target.closest('.dragable'), e.clientY, e.clientX);
	}
});

function dragElement(element, heightPos, widthPos) {
	window.addEventListener('mousemove', startDragElement);
	window.addEventListener('mouseup', stopDragElement);
	let elementTopPos = heightPos - element.offsetTop;
	let elementLeftPos = widthPos - element.offsetLeft;
	element.style.cursor = 'grabbing';
	function startDragElement(e){
		element.style.top = (e.clientY - elementTopPos) + 'px';
		element.style.left = (e.clientX - elementLeftPos) + 'px';
	};

	function stopDragElement() {
		let currentCube = shapes.find(cube => cube.id == element.dataset.id);
		element.dataset.top = element.style.top;
		element.dataset.left = element.style.left;
		currentCube.top = element.style.top;
		currentCube.left = element.style.left;
		localStorage.setItem('shapes', JSON.stringify(shapes));
		element.style.cursor = 'grab';
		window.removeEventListener('mousemove', startDragElement);
		window.removeEventListener('mouseup', stopDragElement);
	};
}

function initCube() {
	const cube = new Cube('0', '0', Date.now(), '#333', 'Cube');
	let newCube = document.createElement('div');
	newCube.dataset.top = cube.top;
	newCube.dataset.left = cube.left;
	newCube.dataset.shape = cube.shape;
	newCube.dataset.id = cube.id;
	newCube.dataset.color = cube.color;
	newCube.style.backgroundColor = cube.color;
	newCube.classList.add('cube','dragable');
	document.body.append(newCube);
	shapes.push(cube);
	localStorage.setItem('shapes', JSON.stringify(shapes));
}

function loadCubes(top, left, id, color, shape) {
	const cube = new Cube(top, left, id, color, shape);
	let loadedCube = document.createElement('div');
	loadedCube.dataset.top = cube.top;
	loadedCube.dataset.left = cube.left;
	loadedCube.dataset.shape = cube.shape;
	loadedCube.dataset.id = cube.id;
	loadedCube.dataset.color = cube.color;
	loadedCube.style.top = cube.top;
	loadedCube.style.left = cube.left;
	loadedCube.style.backgroundColor = cube.color;
	loadedCube.classList.add('cube','dragable');
	document.body.append(loadedCube);
}

document.querySelector('.create').addEventListener('click', (e) => {
	initCube();
});

let delBtn = document.querySelector('.delete');
delBtn.addEventListener('click', (e) => {
	window.addEventListener('click', (e) => {
		if(e.target.closest('.cube')) {
			deleteShape(e.target.closest('.cube'));
		}
	});
});

function deleteShape(shape) {
	const currentCube = shapes.find(cube => cube.id == shape.dataset.id);
	const index = shapes.indexOf(currentCube);
	if (index > -1) {
		shapes.splice(index, 1);
	}
	shape.remove();
	localStorage.setItem('shapes', JSON.stringify(shapes));
}