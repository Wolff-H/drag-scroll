export declare interface Movement {
    x: [drag_trigger_threshold: number, scroll_respond_vector: number];
    y: [drag_trigger_threshold: number, scroll_respond_vector: number];
    swapped: boolean;
}
export declare interface DraggableData {
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
export declare interface ScrollableData {
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
 * @param movement Movement constraint.
 * @param options Options.
 */
export declare function dragScroll(draggable: HTMLElement, scrollable: HTMLElement | null, options?: {
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
export default dragScroll;
