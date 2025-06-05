// utils/loadGooglePicker.ts
export const loadGooglePickerScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (document.getElementById('google-picker')) {
        return resolve();
      }
  
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.id = 'google-picker';
      script.onload = () => resolve();
      script.onerror = reject;
      document.body.appendChild(script);
    });
  };
  