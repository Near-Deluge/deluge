import React, { useEffect } from "react";
import type { NextPage } from "next";

import { useAppSelector } from "../hooks";
import { removeProduct } from "../slices/cart";
import { useDispatch } from "react-redux";

const Cart: NextPage = () => {
  const products = useAppSelector((state) => state.cart.products);
  const dispatch = useDispatch();

  const handleRemove = (id: string) => {
    dispatch(removeProduct(id));
  };

  const handleBuy = () => {
    console.log("Now Handle Buy");
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-4 pb-4">
      <p className="text-4xl font-bold mb-3">Cart</p>

      <div className="flex flex-col w-4/5">
        <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block py-2 min-w-full sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow-md sm:rounded-lg">
              <table className="min-w-full">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400"
                    >
                      Description
                    </th>

                    <th
                      scope="col"
                      className="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400"
                    >
                      Price
                    </th>
                    <th scope="col" className="relative py-3 px-6">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    return (
                      <tr
                        className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-800 even:dark:bg-gray-700 dark:border-gray-600"
                        key={product.id + product.name}
                      >
                        <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white flex">
                          <img src={product.slides[0].img} alt={product.slides[0].title} className="w-5 h-5 mr-2"></img>
                          {product.name}
                        </td>
                        <td className="py-4 px-6 text-sm truncate text-gray-500 whitespace-nowrap dark:text-gray-400 max-w-sm">
                          {product.description}
                        </td>

                        <td className="py-4 px-6 text-sm text-gray-500 whitespace-nowrap dark:text-gray-100">
                          {product.price} {product.currency}
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-right whitespace-nowrap">
                          <a
                            href="#"
                            className="text-blue-600 dark:text-blue-500 hover:underline"
                            onClick={() => handleRemove(product.id)}
                          >
                            Delete
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {products.length > 1 && (
        <div className="w-4/5 flex flex-col justify-end items-end">
          <p className="text-right font-bold text-xl">
            Total Amount:{" "}
            {
              products.reduce(
                (prev, next) => {
                  return {
                    price: parseFloat(prev.price.toString()) + parseFloat(next.price),
                  };
                },
                { price: 0.0 }
              ).price
            }{" "}
            {products[0].currency}
          </p>
          <button
            className="text-white bg-gray-900 rounded p-3 mt-3"
            onClick={handleBuy}
          >
            Buy Now
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
