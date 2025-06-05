declare module 'redux-persist/integration/react' {
    import { ReactNode, ComponentType } from 'react';
    import { Persistor } from 'redux-persist';
  
    interface PersistGateProps {
      loading?: ReactNode;
      persistor: Persistor;
      children?: ReactNode;
    }
  
    export const PersistGate: ComponentType<PersistGateProps>;
  }