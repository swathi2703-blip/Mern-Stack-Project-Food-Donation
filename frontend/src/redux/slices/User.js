import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    data: JSON.parse(localStorage.getItem('userData')) || null,
    token: localStorage.getItem('token') || null,
  },
  reducers: {
    setUser: (state, action) => {
      state.data = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('userData', JSON.stringify(action.payload.user));
    },
    removeUser: (state) => {
      state.data = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
    },
  },
});

export const { setUser, removeUser } = userSlice.actions;
export const getToken = (state) => state.user.token;
export const getUserData = (state) => state.user.data;
export const getUserId = (state) => state.user.data?.id;
export const getUserRole = (state) => state.user.data?.role;
export const getIsLoggedIn = (state) => !!state.user.token;

export default userSlice.reducer;
