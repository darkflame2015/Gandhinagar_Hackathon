import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import loanReducer from './slices/loanSlice';
import riskReducer from './slices/riskSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    loan: loanReducer,
    risk: riskReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
