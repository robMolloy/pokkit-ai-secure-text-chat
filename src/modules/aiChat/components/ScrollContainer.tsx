import { CustomIcon } from "@/components/CustomIcon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DependencyList, useEffect, useRef, useState } from "react";

export const ScrollContainer = (p: {
  children: React.ReactNode;
  className?: string;
  scrollToBottomDeps?: DependencyList;
}) => {
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isScrollingUpwards, setIsScrollingUpwards] = useState(false);
  const scrollContainer = useRef<HTMLDivElement>(null);
  const prevScrollTop = useRef(0);

  const checkIfAtBottom = () => {
    if (!scrollContainer.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer.current;
    const isBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 40;
    setIsAtBottom(isBottom);

    // Update scroll direction
    setIsScrollingUpwards(scrollTop < prevScrollTop.current);
    prevScrollTop.current = scrollTop;
  };

  const scrollToBottom = () => {
    if (!scrollContainer.current) return;
    scrollContainer.current.scrollTop = scrollContainer.current.scrollHeight;
  };

  useEffect(() => {
    if (isAtBottom && !isScrollingUpwards) scrollToBottom();
  }, [p.children]);

  useEffect(() => {
    const container = scrollContainer.current;
    if (!container) return;

    container.addEventListener("scroll", checkIfAtBottom);
    return () => container.removeEventListener("scroll", checkIfAtBottom);
  }, []);

  useEffect(() => checkIfAtBottom(), []);

  useEffect(() => {
    if (p.scrollToBottomDeps) scrollToBottom();
  }, p.scrollToBottomDeps ?? []);

  return (
    <div className="relative flex-1">
      <div className={cn("absolute inset-0 overflow-y-auto", p.className)} ref={scrollContainer}>
        {p.children}
      </div>
      {!isAtBottom && (
        <Button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-8 h-10 w-10 rounded-full shadow-lg transition-colors hover:bg-gray-100"
          aria-label="Scroll to bottom"
        >
          <CustomIcon iconName="ChevronDown" size="lg" />
        </Button>
      )}
    </div>
  );
};
