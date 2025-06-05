import { FunctionComponent } from 'react';
import { HiMoon, HiSun } from 'react-icons/hi';
import { useDispatch, useSelector } from 'react-redux';
import { setThemeMode, ThemeMode } from 'app/features/settingsSlice';
import { AppDispatch, RootState } from 'app/store';
import { Theme } from 'types/theme';
import styles from './theme-toggler.module.scss';

const ThemeToggler: FunctionComponent = () => {
  const currentTheme: Theme = useSelector((state: RootState) => state.settings.currentTheme);
  const themeMode: ThemeMode = useSelector((state: RootState) => state.settings.themeMode);
  const dispatch: AppDispatch = useDispatch();

  const handleToggle = () => {
    // Toggle between light and dark mode directly
    if (currentTheme === Theme.Dark) {
      dispatch(setThemeMode(ThemeMode.Light));
    } else {
      dispatch(setThemeMode(ThemeMode.Dark));
    }
  };

  return (
    <div className={styles['theme-toggler']}>
      {currentTheme === Theme.Dark ? (
        <HiSun
          className={styles.icon}
          onClick={handleToggle}
          title="Switch to light mode"
          role="button"
          aria-label="Switch to light mode"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleToggle();
            }
          }}
        />
      ) : (
        <HiMoon
          className={styles.icon}
          onClick={handleToggle}
          title="Switch to dark mode"
          role="button"
          aria-label="Switch to dark mode"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleToggle();
            }
          }}
        />
      )}
    </div>
  );
};

export default ThemeToggler;