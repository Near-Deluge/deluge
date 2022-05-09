import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Store } from "../../utils/interface";

type StoreState = {
  currentStore: Store;
  allStore: Array<Store>;
};

type ValidStoreField =
  | "address"
  | "name"
  | "lat_lng"
  | "website"
  | "logo"
  | "country"
  | "state"
  | "city"
  | "products";

const initialState = {} as StoreState;

const storeSlice = createSlice({
  name: "store",
  initialState,
  reducers: {
    setStore(state, action: PayloadAction<Store>) {
      state.currentStore = action.payload;
    },
    setField(
      state,
      action: PayloadAction<{ field: ValidStoreField; value: String }>
    ) {
      // Create a New Object and Mutate it
      let newState: Store = {
        ...state.currentStore,
        [action.payload.field]: action.payload.value,
      };
      // Set the Objcet in Overall State
      state.currentStore = newState;
    },
    setLat(state, action: PayloadAction<number>) {
      let newState = {
        ...state.currentStore,
        lat_lng: {
          ...state.currentStore.lat_lng,
          latitude: action.payload,
        },
      };
      state.currentStore = newState;
    },
    setLon(state, action: PayloadAction<number>) {
      let newState = {
        ...state.currentStore,
        lat_lng: {
          ...state.currentStore.lat_lng,
          longitude: action.payload,
        },
      };
      state.currentStore = newState;
    },
  },
});

export const { setStore, setField, setLat, setLon } = storeSlice.actions;

export default storeSlice.reducer;
