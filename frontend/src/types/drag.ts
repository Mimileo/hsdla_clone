export type DragProps = {
  ref: (element: HTMLElement | null) => void;
  style?: React.CSSProperties;
  listeners: React.HTMLAttributes<HTMLElement>;
  attributes: Record<string, unknown>;
  isDragging: boolean;
};
