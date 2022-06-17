import React from "react";

import discord from "../assets/imgs/logos/discord.svg";

const DiscordIcon: React.FC<{
  size?: number;
}> = ({ size }) => {
  const fSize = size || 20;
  return (
    <img
      src={discord}
      alt="discord-icon"
      style={{ height: fSize, width: fSize }}
    ></img>
  );
};

export default DiscordIcon;
