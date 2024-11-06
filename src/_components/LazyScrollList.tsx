import { useEffect, useRef, useState } from 'react';

export const LazyScrollList = <T,>({
  next,
  renderItem,
}: {
  next: (offset: number) => Promise<T[]>;
  renderItem: (item: T) => React.ReactNode;
}) => {
  const [loadedItems, setLoadedItems] = useState<T[]>([]);

  const targetRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!targetRef.current) return;
    const callback: IntersectionObserverCallback = (entrys) => {
      for (const entry of entrys) {
        if (entry.isIntersecting && entry.target === targetRef.current) {
          next(loadedItems.length).then((items) => {
            setLoadedItems([...loadedItems, ...items]);
          });
        }
      }
    };
    const observer = new IntersectionObserver(callback, {
      root: null,
      rootMargin: '0px',
      threshold: 1.0,
    });

    observer.observe(targetRef.current);

    return () => observer.disconnect();
  }, [targetRef, loadedItems, next]);

  return (
    <div>
      {loadedItems.map(renderItem)}
      <div
        ref={targetRef}
        style={{ height: '10px', width: '100%', background: 'red' }}
      ></div>
    </div>
  );
};
