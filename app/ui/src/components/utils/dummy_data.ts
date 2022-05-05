import { faker } from "@faker-js/faker";

export const get_fake_product = () => {
  return {
    img: faker.image.imageUrl(500, 500, "", true),
    seller: faker.company.bs() + ".near",
    description: faker.commerce.productDescription(),
    name: faker.commerce.productName(),
    price: faker.commerce.price(10, 1000, 2, ""),
    currency: "DLG",
    rating: faker.datatype.number({ min: 1, max: 10, precision: 1 }),
    ratings_count: faker.datatype.number({ min: 1000, max: 1000000 }),
  };
};

export const get_fake_products_list = (items: number) => {
  let arr = [];
  for (let i = 0; i < items; ++i) {
    arr.push(get_fake_product());
  }
  return arr;
};
