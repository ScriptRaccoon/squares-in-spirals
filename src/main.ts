import "./style.css";

// TYPES
type point = [number, number];
type square = [point, point, point, point];

// DRAW A SINGLE SQUARE
function draw_square(
	square: square,
	ctx: CanvasRenderingContext2D
): void {
	const [p1, p2, p3, p4] = square;
	ctx.beginPath();
	ctx.moveTo(...p1);
	ctx.lineTo(...p2);
	ctx.lineTo(...p3);
	ctx.lineTo(...p4);
	ctx.lineTo(...p1);
	ctx.lineTo(...p2);
	ctx.stroke();
	ctx.closePath();
}

// LINEAR INTERPOLATE BETWEEN TWO POINTS
function interpolate(p1: point, p2: point, t: number): point {
	const [x1, y1] = p1;
	const [x2, y2] = p2;
	const x = x1 + t * (x2 - x1);
	const y = y1 + t * (y2 - y1);
	return [x, y];
}

// GET THE NEXT SQUARE VIA INTERPOLATION
function get_next_square(square: square, t: number): square {
	const [p1, p2, p3, p4] = square;
	return [
		interpolate(p1, p2, t),
		interpolate(p2, p3, t),
		interpolate(p3, p4, t),
		interpolate(p4, p1, t),
	];
}

// DRAW SQUARES IN SPIRALS ON A CANVAS
function draw_squares(
	canvas: HTMLCanvasElement,
	square_number: number,
	delay: number,
	t: number
): Promise<void> {
	return new Promise((resolve) => {
		const ctx = canvas.getContext("2d")!;
		const offset = ctx.lineWidth / 2;

		const initial_square: square = [
			[offset, offset],
			[canvas.width - offset, offset],
			[canvas.width - offset, canvas.height - offset],
			[offset, canvas.height - offset],
		];

		let current_square = initial_square;
		let counter = 0;

		recursively_draw_squares();

		function recursively_draw_squares(): void {
			counter++;
			draw_square(current_square, ctx);
			if (counter < square_number) {
				current_square = get_next_square(current_square, t);
				setTimeout(recursively_draw_squares, delay);
			} else {
				resolve();
			}
		}
	});
}

// DRAW ONCE WHEN BODY IS CLICKED
document.body.addEventListener("click", draw_all_canvases);

// MAIN DRAW FUNCTION
async function draw_all_canvases() {
	document.body.removeEventListener("click", draw_all_canvases);
	remove_hint_element();

	const canvases = get_canvases();
	setup_canvases(canvases);
	const [canvas1, canvas2, canvas3, canvas4] = canvases;

	const t = 0.1;
	const square_number = 50;
	const delay = 100;

	await draw_squares(canvas1, square_number, delay, 1 - t);
	await draw_squares(canvas2, square_number, delay, t);
	await draw_squares(canvas3, square_number, delay, t);
	await draw_squares(canvas4, square_number, delay, 1 - t);
}

// SETUP OF CANVASES: SIZE AND COLOR
function setup_canvases(canvases: HTMLCanvasElement[]) {
	canvases.forEach((canvas) => {
		const vmin = Math.min(window.innerWidth, window.innerHeight);
		const canvas_size = vmin / 2.2;
		canvas.width = canvas.height = canvas_size;
		const ctx = canvas.getContext("2d")!;
		ctx.lineWidth = Math.round(window.innerWidth / 500);
		ctx.strokeStyle = "#f2c";
	});
}

// GET LIST OF ALL CANVASES IN THE HTML
function get_canvases(): HTMLCanvasElement[] {
	return Array.from(document.querySelectorAll("canvas"));
}

// REMOVE THE HINT ELEMENT
function remove_hint_element() {
	const hint_element = document.getElementById("hint")!;
	hint_element.remove();
}
