// app/ClientProvider.tsx
'use client';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Theme types and slice
export enum ThemeMode {
  Light = 'light',
  Dark = 'dark',
  System = 'system',
}

interface SettingsState {
  currentTheme: ThemeMode;
}

const initialState: SettingsState = {
  currentTheme: ThemeMode.System,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.currentTheme = action.payload;
    },
  },
});

export const { setThemeMode } = settingsSlice.actions;

// Store configuration
const store = configureStore({
  reducer: {
    settings: settingsSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Provider component
export default function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Provider store={store}>{children}</Provider>;
}