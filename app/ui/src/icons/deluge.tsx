import React from "react";

import iconImg from "../assets/imgs/logos/logo.png";

const DelugeIcon: React.FC<{
  size?: number;
}> = ({ size }) => {
  const fSize = size || 20;
  return (
    <img
      src={iconImg}
      alt="deluge-icon"
      style={{ height: fSize, width: fSize }}
    ></img>
  );
};

export default DelugeIcon;
