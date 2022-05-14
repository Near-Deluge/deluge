export const change_stable_to_human = (val: string) => {
  return (parseFloat(val) / 10 ** 8).toFixed(2);
};

export const change_near_to_human = (val: string) => {
  return (parseFloat(val) / 10 ** 24).toFixed(2);
};
