import { useEffect } from 'react';
import { useElementSize } from '../_services';

export const SizeFitComponent = ({
  children,
  transformOrigin,
}: React.PropsWithChildren<{ transformOrigin?: string }>) => {
  const {
    ref: parentRef,
    size: parentSize,
    handleResize: parentResize,
  } = useElementSize();
  const {
    ref: targetRef,
    size: targetSize,
    handleResize: targetResize,
  } = useElementSize();

  useEffect(() => {
    if (!targetRef.current) return;

    // サイズが確定してなかったら処理しない
    if (
      targetSize.scroll.width === 0 ||
      targetSize.scroll.height === 0 ||
      parentSize.client.width === 0 ||
      parentSize.client.height === 0
    )
      return;

    // 親枠の領域に合わせるため、縦横大きくはみ出てる方に合わせる
    const wR = parentSize.client.width / targetSize.scroll.width;
    const hR = parentSize.client.height / targetSize.scroll.height;
    const r = Math.min(wR, hR);
    if (r === 0) return;

    // 親フレームに合わせて拡縮
    targetRef.current.style.transform = `scale(${r})`;
    targetRef.current.style.transformOrigin = transformOrigin ?? 'center';
  }, [parentSize, targetSize, targetRef, transformOrigin]);

  // safari対策
  useEffect(() => {
    parentResize();
    targetResize();
  }, [parentResize, targetResize]);

  return (
    <div
      ref={parentRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div ref={targetRef} style={{ position: 'absolute' }}>
        {children}
      </div>
    </div>
  );
};
