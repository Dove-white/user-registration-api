// Function to generate a random color
function getRandomColor() {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return `#${randomColor.padStart(6, "0")}`;
}

// Function to calculate the luminance of a color (based on its RGB values)
function getLuminance(hex) {
  const rgb = hexToRgb(hex);
  const [r, g, b] = rgb.map((c) => {
    const component = c / 255;
    return component <= 0.03928
      ? component / 12.92
      : Math.pow((component + 0.055) / 1.055, 2.4);
  });

  // Relative luminance formula (https://en.wikipedia.org/wiki/Relative_luminance)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Function to convert HEX to RGB
function hexToRgb(hex) {
  const parsedHex = hex.replace("#", "");
  const bigint = parseInt(parsedHex, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

// Function to generate a background color with sufficient contrast for white text
exports.generateBackgroundColor = function () {
  let backgroundColor = getRandomColor();
  let luminance = getLuminance(backgroundColor);

  // Regenerate if luminance is too high (too light for white text)
  while (luminance > 0.5) {
    backgroundColor = getRandomColor();
    luminance = getLuminance(backgroundColor);
  }

  return backgroundColor;
};
