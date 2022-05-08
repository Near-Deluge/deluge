import { createSlice, PayloadAction, Store } from "@reduxjs/toolkit";

export interface User {
  accountId: String;
  balance: String;
  store: null | Store;
}

export interface ContractState {
  nearConfig?: any;
  user: User;
}

const initialState = {
  user: {
    accountId: "",
    balance: "",
    store: null,
  },
} as ContractState;

const contractSlice = createSlice({
  name: "contract",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    setStore(state, action: PayloadAction<Store | null>) {
      state.user.store = action.payload;
    },
    setState(state, action: PayloadAction<ContractState>) {
      state = action.payload;
    },
  },
});

export const { setUser, setState, setStore } = contractSlice.actions;

export default contractSlice.reducer;
