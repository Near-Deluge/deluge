import React from "react";

type PH_S = {
  size?: string;
};

const Placeholder_Square: React.FC<PH_S> = ({ size }) => {
  return <div style={{
      height: size || "100%",
      width: size || "100%",
      background: "#ccc"
  }}></div>;
};

export default Placeholder_Square;
