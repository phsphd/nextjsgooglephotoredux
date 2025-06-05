// ./components/albums/empty-state.tsx
import { FunctionComponent } from 'react';
import styles from './empty-state.module.scss';

interface EmptyStateProps {
  title: string;
  message: string;
  showCreateButton?: boolean;
  onCreateAlbum?: () => void;
}

const EmptyState: FunctionComponent<EmptyStateProps> = ({
  title,
  message,
  showCreateButton = false,
  onCreateAlbum
}) => {
  return (
    <div className={styles.emptyState}>
      <div className={styles.content}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className={styles.icon}>
          <path
            d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M8 10L12 14L16 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h3>{title}</h3>
        <p>{message}</p>
        {showCreateButton && onCreateAlbum && (
          <button onClick={onCreateAlbum} className={styles.createButton}>
            Create Your First Album
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;