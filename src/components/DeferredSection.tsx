import { PropsWithChildren, useEffect, useRef, useState } from "react";

type DeferredSectionProps = PropsWithChildren<{
  minHeight?: number;
  rootMargin?: string;
}>;

const DeferredSection = ({
  children,
  minHeight = 320,
  rootMargin = "400px 0px",
}: DeferredSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = anchorRef.current;
    if (!node || isVisible) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  return (
    <div
      ref={anchorRef}
      style={{
        minHeight: isVisible ? undefined : minHeight,
        contentVisibility: isVisible ? "visible" : "auto",
        containIntrinsicSize: `${minHeight}px`,
      }}
    >
      {isVisible ? children : null}
    </div>
  );
};

export default DeferredSection;
