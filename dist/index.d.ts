interface Movement {
    x: [drag_trigger_threshold: number, scroll_respond_vector: number];
    y: [drag_trigger_threshold: number, scroll_respond_vector: number];
    swapped: boolean;
}
interface Options {
    movement: Movement;
    destroy: boolean;
    override: boolean;
    avoid: HTMLElement[];
    constrained: boolean;
    hooks: DraggableData["hooks"];
}
interface DragScrollData {
    tool_name: string;
    description: string;
    draggable_to_draggable_data_map: DraggableToDraggableDataMap;
    active_draggable: HTMLElement | null;
}
declare type DraggableToDraggableDataMap = WeakMap<HTMLElement, DraggableData>;
interface DraggableData {
    mouse_start_x: number;
    mouse_start_y: number;
    avoid: HTMLElement[];
    scrollable_data_array: ScrollableData[];
    hooks: {
        dragStart?: (event: MouseEvent, draggable: HTMLElement, draggable_data: DraggableData) => void | false;
        drag?: (event: MouseEvent, draggable: HTMLElement, draggable_data: DraggableData) => void | false;
        dragEnd?: (event: MouseEvent, draggable: HTMLElement, draggable_data: DraggableData) => void;
    };
}
interface ScrollableData {
    scrollable: HTMLElement;
    scrollable_start_scroll_x: number;
    scrollable_start_scroll_y: number;
    movement: Movement;
    constrained: boolean;
}
/**
 * Offers ability of scrolling element by dragging.
 * @param draggable Draggable. The trigger element for dragscroll action.
 * @param scrollable Scrollable. The Responsive element for dragscroll action.
 * @param options Options.
 */
declare function dragScroll(draggable: HTMLElement, scrollable: HTMLElement | null, options?: {
    movement?: {
        x?: [number, number];
        y?: [number, number];
        swapped?: boolean;
    };
    constrained?: boolean;
    destroy?: boolean;
    override?: boolean;
    avoid?: HTMLElement[];
    hooks?: {
        dragStart?: (event: MouseEvent, draggable: HTMLElement, draggable_data: DraggableData) => void | false;
        drag?: (event: MouseEvent, draggable: HTMLElement, draggable_data: DraggableData) => void | false;
        dragEnd?: (event: MouseEvent, draggable: HTMLElement, draggable_data: DraggableData) => void;
    };
}): void;
export { Movement, Options, DragScrollData, DraggableToDraggableDataMap, DraggableData, ScrollableData, };
export default dragScroll;
