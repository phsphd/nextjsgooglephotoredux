// app/layout.tsx
'use client';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import '../styles/globals.scss';

// Theme management
export enum ThemeMode {
  Light = 'light',
  Dark = 'dark',
  System = 'system',
}

interface SettingsState {
  currentTheme: ThemeMode;
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState: { currentTheme: ThemeMode.System } as SettingsState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.currentTheme = action.payload;
    },
  },
});

export const { setThemeMode } = settingsSlice.actions;

// Store
const store = configureStore({
  reducer: {
    settings: settingsSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Layout component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Provider store={store}>
          {children}
        </Provider>
      </body>
    </html>
  );
}