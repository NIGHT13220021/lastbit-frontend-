// LastBite — Minimal Red & White Food Marketplace Theme (Zomato-style)

const colors = {
  // Backgrounds
  bg: "#F8F8F8",
  surface: "#FFFFFF",
  cardAlt: "#F2F2F2",
  field: "#F2F2F2",

  // Brand
  primary: "#E23744",
  onPrimary: "#FFFFFF",
  primarySoft: "#FCE8EA",

  // Discounts and deals
  accent: "#E23744",
  accentSoft: "#FCE8EA",
  accentText: "#B51F2C",

  // Text
  text: "#1C1C1C",
  textMuted: "#696969",

  // Borders
  border: "#E8E8E8",

  // Errors
  danger: "#D32F2F",
  dangerSoft: "#FDECEC",

  // Favorites
  heart: "#E23744",

  // Success
  success: "#267A4B",
  successSoft: "#E5F3E9",

  // Deal status
  soldOut: "#777777",
  soldOutSoft: "#EEEEEE",

  // Ratings
  rating: "#E5A000",
  ratingSoft: "#FFF4D6",
};

// Subtle, flat shadows (Zomato keeps cards almost flat)
export const softShadow = {
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};

// shadow for bars that sit at the bottom of the screen (tab bar, footers)
export const shadow = {
  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: -2 },
  elevation: 8,
};

export default colors;