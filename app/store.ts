// app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';
import settingsReducer from './features/settingsSlice';
import photoLibraryReducer from './features/photoLibrarySlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['settings'], // Only persist settings, not photoLibrary (too large)
};

// Combine reducers
const rootReducer = combineReducers({
  settings: settingsReducer,
  photoLibrary: photoLibraryReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store with persisted reducer
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;