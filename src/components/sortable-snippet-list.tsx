import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Link } from "@tanstack/react-router";

export type SortableSnippet = {
  id: string;
  title: string;
  language: string;
  visibility: string;
};

const KEY = "prosa.snippet-order";

function loadOrder(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveOrder(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(ids));
}

export function SortableSnippetList({ snippets }: { snippets: SortableSnippet[] }) {
  const [items, setItems] = useState<SortableSnippet[]>(snippets);

  useEffect(() => {
    const order = loadOrder();
    const byId = new Map(snippets.map((s) => [s.id, s]));
    const ordered: SortableSnippet[] = [];
    order.forEach((id) => {
      const s = byId.get(id);
      if (s) {
        ordered.push(s);
        byId.delete(id);
      }
    });
    byId.forEach((s) => ordered.push(s));
    setItems(ordered);
  }, [snippets]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setItems((curr) => {
      const oldIdx = curr.findIndex((i) => i.id === active.id);
      const newIdx = curr.findIndex((i) => i.id === over.id);
      const next = arrayMove(curr, oldIdx, newIdx);
      saveOrder(next.map((s) => s.id));
      return next;
    });
  };

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No snippets yet.</p>;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2">
          {items.map((s) => (
            <SortableRow key={s.id} snippet={s} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({ snippet }: { snippet: SortableSnippet }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: snippet.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 p-3"
    >
      <button
        {...attributes}
        {...listeners}
        aria-label="Reorder snippet"
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" aria-hidden="true" />
      </button>
      <Link
        to="/snippets/$id"
        params={{ id: snippet.id }}
        className="flex-1 truncate text-sm text-foreground hover:text-primary"
      >
        {snippet.title || "Untitled"}
      </Link>
      <span className="text-xs text-muted-foreground">{snippet.language}</span>
      <span
        className={[
          "rounded-full px-2 py-0.5 text-[10px]",
          snippet.visibility === "public" ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground",
        ].join(" ")}
      >
        {snippet.visibility}
      </span>
    </li>
  );
}
