const IMAGES = [
	'cio3.jpg',
	'grafiti.jpg',
]

const loadImage = (src) => {
	const img = new Image();
	
	const result = new Promise((resolve, reject) => {
		img.onload = resolve(img);
		img.onerror = reject(new Error(`Could not load ${src}`));
	});
	
	img.src = `dist/images/${src}`;
	
	return result ;
}

const loadImages = (srcs) => {
	return Promise.all(srcs.map(src => loadImage(src)));
}

const createCanvas = (width, height) => {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	return canvas;
}

const getImageData = (width, height, img) => {	
	const bufferCanvas = createCanvas(width, height);
	const bufferCanvasContext = bufferCanvas.getContext('2d');
	
	bufferCanvasContext.drawImage(img, 0, 0);
	return bufferCanvasContext.getImageData(0, 0, width, height);
}

const getAntialiasedData = (sourceData, ofsX, ofsY, tpo) => {
	var range = 15;
	var count = 0, sum = 0;
	for (let x = ofsX - range; x < ofsX + range; x++) {
		for (let y = ofsY - range; y < ofsY + range; y++) {
			var targetPix = y * 512 + x, targetPos = targetPix * 4;
			if(sourceData[targetPos + tpo]) {
				sum += sourceData[targetPos + tpo];
				count++;
			}
		}
	}
	return sum / count;
}

const init = () => {
	const canvas = document.querySelector('canvas');
	canvas.width = 512;
	canvas.height = 512;
	const ctx = canvas.getContext('2d');
	
	loadImages(IMAGES).then(images => {
		console.log(images);
		setTimeout(() => {
			const mapData = getImageData(512, 512, images[0]);
			const sourceData = getImageData(512, 512, images[1]);
			const outputData = ctx.createImageData(512, 512);
			console.log(mapData, sourceData);
			const dy = 32, dx = 100;
			
			for (var y = 0; y < 512; y++) {
				for (var x = 0; x < 512; x++) {

					// Get the greyscale value from the displacement map as a value between 0 and 1
					// 0 = black (farthest), 1 = white (nearest)
					// Higher values will be more displaced
					var pix = y * 512 + x,
						arrayPos = pix * 4,
						depth = mapData.data[arrayPos] / 255;

					// Use the greyscale value as a percentage of our current drift,
					// and calculate an xy pixel offset based on that
					var ofs_x = Math.round(x + (dx * depth)),
						ofs_y = Math.round(y + (dy * depth));

					// Clamp the offset to the canvas dimensions
					if (ofs_x < 0) ofs_x = 0;
					if (ofs_x > 512 - 1) ofs_x = 512 - 1;
					if (ofs_y < 0) ofs_y = 0;
					if (ofs_y > 512 - 1) ofs_y = 512 - 1;

					outputData.data[arrayPos] = getAntialiasedData(sourceData.data, ofs_x, ofs_y, 0);
					outputData.data[arrayPos + 1] = getAntialiasedData(sourceData.data, ofs_x, ofs_y, 1);
					outputData.data[arrayPos + 2] = getAntialiasedData(sourceData.data, ofs_x, ofs_y, 2);
					outputData.data[arrayPos + 3] = getAntialiasedData(sourceData.data, ofs_x, ofs_y, 3);
				}
			}
			ctx.putImageData(outputData, 0, 0);
			console.log('DONE', outputData);
		}, 1000);
	});
}

window.load = init();