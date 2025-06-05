// app/ReduxProvider.tsx - Redux Provider setup
'use client';

import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { AppWrapper } from './providers';

interface ReduxProviderProps {
  children: ReactNode;
}

export const ReduxProvider: React.FC<ReduxProviderProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <AppWrapper>
        {children}
      </AppWrapper>
    </Provider>
  );
};

export default ReduxProvider;