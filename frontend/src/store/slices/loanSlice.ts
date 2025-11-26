import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LoanState {
  loans: any[];
  currentLoan: any | null;
  loading: boolean;
}

const initialState: LoanState = {
  loans: [],
  currentLoan: null,
  loading: false,
};

const loanSlice = createSlice({
  name: 'loan',
  initialState,
  reducers: {
    setLoans: (state, action: PayloadAction<any[]>) => {
      state.loans = action.payload;
    },
    setCurrentLoan: (state, action: PayloadAction<any>) => {
      state.currentLoan = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setLoans, setCurrentLoan, setLoading } = loanSlice.actions;
export default loanSlice.reducer;
