// https://raw.githubusercontent.com/antimatter15/rgb-lab/master/color.js
module.exports.lab2rgb = (lab) => {
  var y = (lab[0] + 16) / 116,
  x = lab[1] / 500 + y,
  z = y - lab[2] / 200,
  r, g, b;

  x = 0.95047 * ((x * x * x > 0.008856) ? x * x * x : (x - 16/116) / 7.787);
  y = 1.00000 * ((y * y * y > 0.008856) ? y * y * y : (y - 16/116) / 7.787);
  z = 1.08883 * ((z * z * z > 0.008856) ? z * z * z : (z - 16/116) / 7.787);

  r = x *  3.2406 + y * -1.5372 + z * -0.4986;
  g = x * -0.9689 + y *  1.8758 + z *  0.0415;
  b = x *  0.0557 + y * -0.2040 + z *  1.0570;

  r = (r > 0.0031308) ? (1.055 * Math.pow(r, 1/2.4) - 0.055) : 12.92 * r;
  g = (g > 0.0031308) ? (1.055 * Math.pow(g, 1/2.4) - 0.055) : 12.92 * g;
  b = (b > 0.0031308) ? (1.055 * Math.pow(b, 1/2.4) - 0.055) : 12.92 * b;

  return [
    Math.max(0, Math.min(1, r)) * 255,
    Math.max(0, Math.min(1, g)) * 255,
    Math.max(0, Math.min(1, b)) * 255
  ];
}

module.exports.rgb2lab = (rgb) => {
  var r = rgb[0] / 255,
  g = rgb[1] / 255,
  b = rgb[2] / 255,
  x, y, z;

  r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

  x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
  y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
  z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

  return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
}

module.exports.deltaE = (labA, labB) => {
  var deltaL = labA[0] - labB[0];
  var deltaA = labA[1] - labB[1];
  var deltaB = labA[2] - labB[2];
  var c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
  var c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
  var deltaC = c1 - c2;
  var deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
  deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
  var sc = 1.0 + 0.045 * c1;
  var sh = 1.0 + 0.015 * c1;
  var deltaLKlsl = deltaL / (1.0);
  var deltaCkcsc = deltaC / (sc);
  var deltaHkhsh = deltaH / (sh);
  var i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
  return i < 0 ? 0 : Math.sqrt(i);
}

// https://codepen.io/davidhalford/pen/ywEva
module.exports.getCorrectTextColor = (hex) => {
  const hexToR = (h) =>  parseInt((cutHex(h)).substring(0,2),16);
  const hexToG = (h) =>  parseInt((cutHex(h)).substring(2,4),16);
  const hexToB = (h) =>  parseInt((cutHex(h)).substring(4,6),16);
  const cutHex = (h) =>  (h.charAt(0)=="#") ? h.substring(1,7) : h;
  const r = hexToR(hex);
  const g = hexToG(hex);
  const b = hexToB(hex);
  const cBrightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  const threshold = 130; /* about half of 256. Lower threshold equals more dark text on dark background  */
  return cBrightness > threshold ? "#000000" : "#ffffff"
}


// https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
module.exports.hex2rgb = (hex) => {
  return hex
  .replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i  ,(m, r, g, b) => {
    return '#' + r + r + g + g + b + b
  })
  .substring(1).match(/.{2}/g)
  .map(x => parseInt(x, 16));
};

module.exports.rgb2hex = (r, g, b) => {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join("");
};

module.exports.rgb2hsl = (r, g, b) => {
  if (arguments.length === 1) {
    g = r.g, b = r.b, r = r.r;
  }

  var max = Math.max(r, g, b), min = Math.min(r, g, b),
  d = max - min,
  h,
  s = (max === 0 ? 0 : d / max),
  v = max / 255;

  switch (max) {
    case min: h = 0; break;
    case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
    case g: h = (b - r) + d * 2; h /= 6 * d; break;
    case b: h = (r - g) + d * 4; h /= 6 * d; break;
  }

  return {
    h: h,
    s: s,
    v: v
  };
};
