import React from "react";

import iconImg from "../assets/imgs/logos/logo.png";
import iconFImg from "../assets/imgs/logos/logo_full.png";

const DelugeIcon: React.FC<{
  size?: number;
  height?: number;
  width?: number;
  variant?: "full" | "short";
}> = ({ size, variant, width, height }) => {
  const fSize = size || 20;
  const fWidth = width || 100;
  const fHeight = height || 30;
  const fVariant = variant || "short";
  return fVariant === "short" ? (
    <img
      src={iconImg}
      alt="deluge-icon"
      style={{ height: fSize, width: fSize }}
    ></img>
  ) : (
    <img
      src={iconFImg}
      alt="deluge-full-icon"
      style={{ height: fHeight, width: fWidth }}
    />
  );
};

export default DelugeIcon;
