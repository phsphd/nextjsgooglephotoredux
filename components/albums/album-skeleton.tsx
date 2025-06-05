// ./components/albums/album-skeleton.tsx
import { FunctionComponent } from 'react';
import styles from './album-skeleton.module.scss';

const AlbumSkeleton: FunctionComponent = () => {
  return (
    <div className={styles.skeleton}>
      <div className={styles.imageContainer}>
        <div className={styles.imagePlaceholder}></div>
      </div>
      <div className={styles.content}>
        <div className={styles.titlePlaceholder}></div>
        <div className={styles.metaPlaceholder}></div>
      </div>
    </div>
  );
};

export default AlbumSkeleton;