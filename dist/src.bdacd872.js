// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  // Override the current require with this new one
  return newRequire;
})({2:[function(require,module,exports) {
var IMAGES = ['cio3.jpg', 'ripple.png'];

var loadImage = function loadImage(src) {
	var img = new Image();

	var result = new Promise(function (resolve, reject) {
		img.onload = resolve(img);
		img.onerror = reject(new Error('Could not load ' + src));
	});

	img.src = '/images/' + src;

	return result;
};

var loadImages = function loadImages(srcs) {
	return Promise.all(srcs.map(function (src) {
		return loadImage(src);
	}));
};

var createCanvas = function createCanvas(width, height) {
	var canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	return canvas;
};

var getImageData = function getImageData(width, height, img) {
	var bufferCanvas = createCanvas(width, height);
	var bufferCanvasContext = bufferCanvas.getContext('2d');

	bufferCanvasContext.drawImage(img, 0, 0);
	return bufferCanvasContext.getImageData(0, 0, width, height);
};

var getAntialiasedData = function getAntialiasedData(sourceData, ofsX, ofsY, tpo) {
	var range = 15;
	var count = 0,
	    sum = 0;
	for (var x = ofsX - range; x < ofsX + range; x++) {
		for (var y = ofsY - range; y < ofsY + range; y++) {
			var targetPix = y * 512 + x,
			    targetPos = targetPix * 4;
			if (sourceData[targetPos + tpo]) {
				sum += sourceData[targetPos + tpo];
				count++;
			}
		}
	}
	return sum / count;
};

var init = function init() {
	var canvas = document.querySelector('canvas');
	canvas.width = 512;
	canvas.height = 512;
	var ctx = canvas.getContext('2d');

	loadImages(IMAGES).then(function (images) {
		console.log(images);
		setTimeout(function () {
			var mapData = getImageData(512, 512, images[0]);
			var sourceData = getImageData(512, 512, images[1]);
			var outputData = ctx.createImageData(512, 512);
			console.log(mapData, sourceData);
			var dy = -128,
			    dx = -128;

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
					var ofs_x = Math.round(x + dx * depth),
					    ofs_y = Math.round(y + dy * depth);

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
};

window.load = init();
},{}],7:[function(require,module,exports) {

var OVERLAY_ID = '__parcel__error__overlay__';

var global = (1, eval)('this');
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };

  module.bundle.hotData = null;
}

module.bundle.Module = Module;

var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = '' || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + '19830' + '/');
  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });

      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');

      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);

      removeErrorOverlay();

      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;

  // html encode message and stack trace
  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;

  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';

  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(+k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};
  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},[7,2])
//# sourceMappingURL=/src.bdacd872.map