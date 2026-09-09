import { useEffect } from 'react';

export const usePageTitle = (title) => {
  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);
};

export default usePageTitle;
