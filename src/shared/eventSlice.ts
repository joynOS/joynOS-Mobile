import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type EventsState = {
  joinedIds: string[];
};

const initialState: EventsState = {
  joinedIds: [],
};

const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setJoinedIds(state, action: PayloadAction<string[]>) {
      state.joinedIds = action.payload;
    },
    addJoinedId(state, action: PayloadAction<string>) {
      if (!state.joinedIds.includes(action.payload)) state.joinedIds.push(action.payload);
    },
    removeJoinedId(state, action: PayloadAction<string>) {
      state.joinedIds = state.joinedIds.filter((id) => id !== action.payload);
    },
  },
});

export const { setJoinedIds, addJoinedId, removeJoinedId } = eventSlice.actions;
export default eventSlice.reducer;
