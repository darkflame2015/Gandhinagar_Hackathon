import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RiskState {
  currentAssessment: any | null;
  assessmentHistory: any[];
  loading: boolean;
}

const initialState: RiskState = {
  currentAssessment: null,
  assessmentHistory: [],
  loading: false,
};

const riskSlice = createSlice({
  name: 'risk',
  initialState,
  reducers: {
    setCurrentAssessment: (state, action: PayloadAction<any>) => {
      state.currentAssessment = action.payload;
    },
    setAssessmentHistory: (state, action: PayloadAction<any[]>) => {
      state.assessmentHistory = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setCurrentAssessment, setAssessmentHistory, setLoading } = riskSlice.actions;
export default riskSlice.reducer;
