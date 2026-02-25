export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1 rounded-full border border-border bg-card px-3 py-2">
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.2s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.1s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
      </div>
      <span className="text-xs text-muted-foreground">Typing…</span>
    </div>
  );
}

