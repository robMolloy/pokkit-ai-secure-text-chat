import { CustomIcon } from "@/components/CustomIcon";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";

export const AiInputTextForm = (p: {
  disabled: boolean;
  onSubmit: (p: { text: string }) => Promise<unknown>;
}) => {
  const [text, setText] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (!textareaRef.current) return;

    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter" || e.shiftKey) return;

    if (!e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      if (p.disabled) return;
      return e.currentTarget.form?.requestSubmit();
    }

    const cursorPosition = e.currentTarget.selectionStart;
    const textBefore = text.substring(0, cursorPosition);
    const textAfter = text.substring(cursorPosition);
    setText(textBefore + "\n" + textAfter);
    setTimeout(() => {
      if (!textareaRef.current) return;

      textareaRef.current.selectionStart = cursorPosition + 1;
      textareaRef.current.selectionEnd = cursorPosition + 1;
    }, 0);
  };

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (p.disabled) return;

        const promise = p.onSubmit({ text });

        setText("");

        await promise;
      }}
    >
      <div>
        <div className="mt-2 flex items-start">
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              className={`w-full resize-none rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
              rows={1}
              style={{ minHeight: "80px", maxHeight: "160px" }}
            />
            <Button
              type="submit"
              disabled={p.disabled}
              className="absolute bottom-2 right-2 h-8 w-8 p-0"
            >
              <CustomIcon iconName="Upload" size="sm" />
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};
