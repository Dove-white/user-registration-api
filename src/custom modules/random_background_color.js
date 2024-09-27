// Function to calculate luminance of a color
const getLuminance = (r, g, b) => {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

// Function to determine text color based on background color luminance
const getTextColor = (backgroundColor) => {
  // Remove '#' if present and convert hex to RGB
  const hex = backgroundColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const luminance = getLuminance(r, g, b);

  // If luminance is low, return white; if high, return black or dark gray
  return luminance > 0.5 ? "#333333" : "#000000"; // Dark gray or black text
};

// Example: Generate a random background color and determine text color
exports.generateRandomColor = () => {
  const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  const textColor = getTextColor(randomColor);
  return { backgroundColor: randomColor, textColor };
};
