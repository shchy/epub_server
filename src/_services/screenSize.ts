import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export const useScreenSize = () => {
  const [windowSize, setWindowSize] = useState<{
    width: number;
    height: number;
  }>({
    height: 0,
    width: 0,
  });

  const [_window] = useState(window);
  const isClient = useMemo(() => typeof _window === 'object', [_window]);

  const getSize = useCallback(() => {
    return {
      width: isClient ? _window.innerWidth : undefined,
      height: isClient ? _window.innerHeight : undefined,
    };
  }, [_window, isClient]);

  const handleResize = useCallback(() => {
    if (!isClient) return;
    const currentSize = getSize();
    setWindowSize({
      width: currentSize.width ?? windowSize.width,
      height: currentSize.height ?? windowSize.height,
    });
  }, [isClient, getSize, windowSize]);

  useEffect(() => {
    if (!_window) return;

    _window.removeEventListener('resize', handleResize);
    _window.addEventListener('resize', handleResize);
    return () => _window.removeEventListener('resize', handleResize);
  }, [_window, isClient, handleResize]);

  useEffect(() => handleResize(), []);

  return windowSize;
};

export const useElementSize = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{
    scroll: {
      width: number;
      height: number;
    };
    client: {
      width: number;
      height: number;
    };
  }>({
    scroll: {
      height: 0,
      width: 0,
    },
    client: {
      height: 0,
      width: 0,
    },
  });

  const getSize = useCallback(() => {
    if (!ref.current) return;
    return {
      scroll: {
        width: ref.current.scrollWidth,
        height: ref.current.scrollHeight,
      },
      client: {
        width: ref.current.clientWidth,
        height: ref.current.clientHeight,
      },
    };
  }, [ref]);

  const handleResize = useCallback(() => {
    const currentSize = getSize();
    if (!currentSize) return;
    setSize(currentSize);
  }, [getSize]);

  useEffect(() => {
    const resizeable = ref.current;
    if (!resizeable) return;

    //要素のリサイズイベント取得
    const observer = new MutationObserver(() => {
      handleResize();
    });
    observer.observe(resizeable, {
      attributes: true, // 属性変化の監視
      childList: true,
      subtree: true,
    });
    handleResize();

    ref.current.removeEventListener('resize', handleResize);
    ref.current.addEventListener('resize', handleResize);
    return () => observer.disconnect();
  }, [ref, handleResize]);

  useEffect(() => handleResize(), [ref]);

  return {
    ref,
    size,
    handleResize,
  };
};
