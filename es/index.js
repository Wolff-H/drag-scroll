/**
 * Offers ability of scrolling element by dragging.
 * @param draggable Draggable. The trigger element for dragscroll action.
 * @param scrollable Scrollable. The Responsive element for dragscroll action.
 * @param movement Movement constraint.
 * @param options Options.
 */
function dragScroll(draggable, scrollable, options = {}) {
    // defaults --------------------------------------------------------------------------------------------------------
    const default_movement = {
        x: [1, 1],
        y: [1, 1],
        swapped: false,
    };
    const default_options = {
        movement: default_movement,
        destroy: false,
        override: false,
        avoid: [],
        constrained: false,
        hooks: {},
    };
    if (!window.__DragScroll) {
        window.__DragScroll =
            {
                tool_name: 'drag-scroll',
                description: 'Scroll elements corresponding to a drag behavior.',
                draggable_to_draggable_data_map: new WeakMap(),
                active_draggable: null,
            };
    }
    const map = window.__DragScroll.draggable_to_draggable_data_map;
    // composed params -------------------------------------------------------------------------------------------------
    const _options = {
        ...default_options,
        ...options,
        movement: {
            ...default_movement,
            ...options.movement,
        }
    };
    // take one desired action -----------------------------------------------------------------------------------------
    // #1. destroy - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // remove whole record //
    if (scrollable === null) {
        if (map.has(draggable)) {
            map.delete(draggable);
            draggable.removeEventListener('mousedown', _dragStart);
        }
        return;
    }
    // remove target scrollable //
    if (_options.destroy) {
        const draggable_data = map.get(draggable);
        if (draggable_data) {
            const { scrollable_data_array } = draggable_data;
            const target_scrollable_data_index = scrollable_data_array.findIndex((scrollable_data) => {
                return scrollable_data.scrollable === scrollable;
            });
            if (target_scrollable_data_index >= 0) {
                scrollable_data_array.splice(target_scrollable_data_index, 1);
            }
        }
        return;
    }
    // #2. create - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
    if (!map.has(draggable)) {
        map.set(draggable, {
            mouse_start_x: 0,
            mouse_start_y: 0,
            avoid: _options.avoid,
            hooks: _options.hooks,
            scrollable_data_array: [
                {
                    scrollable: scrollable,
                    scrollable_start_scroll_x: 0,
                    scrollable_start_scroll_y: 0,
                    movement: _options.movement,
                    constrained: _options.constrained,
                },
            ],
        });
        draggable.addEventListener('mousedown', _dragStart);
    }
    // #3. update - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
    else {
        // override whole scrollable_data_array to only contain target scrollable_data //
        if (_options.override) {
            map.set(draggable, {
                mouse_start_x: 0,
                mouse_start_y: 0,
                avoid: _options.avoid,
                hooks: _options.hooks,
                scrollable_data_array: [
                    {
                        scrollable: scrollable,
                        scrollable_start_scroll_x: 0,
                        scrollable_start_scroll_y: 0,
                        movement: _options.movement,
                        constrained: _options.constrained,
                    },
                ],
            });
        }
        // update target scrollable_data in scrollable_data_array //
        else if (map.has(draggable)) {
            const draggable_data = map.get(draggable);
            /*
                !!! TODO： update should be a brand new initialization
            */
            if (draggable_data) {
                draggable_data.avoid = _options.avoid;
                const target_scrollable_data = draggable_data.scrollable_data_array.find((scrollable_data) => {
                    return scrollable_data.scrollable === scrollable;
                });
                if (target_scrollable_data) {
                    target_scrollable_data.movement = _options.movement;
                    // target_scrollable_data.constrained = _options.constrained
                }
            }
        }
        // add the passed scrollable_data as a new one to scrollable_data_array //
        else {
            const draggable_data = map.get(draggable);
            if (draggable_data) {
                draggable_data.scrollable_data_array.push({
                    scrollable: scrollable,
                    scrollable_start_scroll_x: 0,
                    scrollable_start_scroll_y: 0,
                    movement: _options.movement,
                    constrained: _options.constrained,
                });
            }
        }
    }
}
function _dragStart(event) {
    const draggable = this;
    const map = window.__DragScroll.draggable_to_draggable_data_map;
    const draggable_data = map.get(draggable);
    // use custom hook //
    if (draggable_data.hooks?.dragStart && draggable_data.hooks?.dragStart(event, draggable, draggable_data) === false)
        return;
    // drag starts only when not mousedown on avoid //
    if (!draggable_data.avoid.includes(event.target)) {
        draggable_data.mouse_start_x = event.clientX;
        draggable_data.mouse_start_y = event.clientY;
        // initialize scrollable_data_array //
        for (const scrollable_data of draggable_data.scrollable_data_array) {
            const { scrollable } = scrollable_data;
            scrollable_data.scrollable_start_scroll_x = scrollable.scrollLeft;
            scrollable_data.scrollable_start_scroll_y = scrollable.scrollTop;
        }
        window.__DragScroll.active_draggable = draggable;
        document.addEventListener('mousemove', _drag);
        document.addEventListener('mouseup', _dragEnd);
    }
}
function _drag(event) {
    const draggable = window.__DragScroll.active_draggable;
    const map = window.__DragScroll.draggable_to_draggable_data_map;
    const draggable_data = map.get(draggable);
    // use custom hook //
    if (draggable_data.hooks?.drag && draggable_data.hooks?.drag(event, draggable, draggable_data) === false)
        return;
    let i = draggable_data.scrollable_data_array.length;
    while (i--) {
        const scrollable_data = draggable_data.scrollable_data_array[i];
        if (scrollable_data.scrollable) // check if the scrollable is obsolete
         {
            if (!scrollable_data.constrained || event.target === draggable) {
                // drag_trigger_threshold (1 threshold triggers 1 step) //
                const step_x = Math.ceil((draggable_data.mouse_start_x - event.clientX) / scrollable_data.movement.x[0]);
                const step_y = Math.ceil((draggable_data.mouse_start_y - event.clientY) / scrollable_data.movement.y[0]);
                // scroll_respond_vector //
                let scroll_x = 0, scroll_y = 0;
                if (scrollable_data.movement.swapped) {
                    scroll_x = step_y * scrollable_data.movement.y[1];
                    scroll_y = step_x * scrollable_data.movement.x[1];
                }
                else {
                    scroll_x = step_x * scrollable_data.movement.x[1];
                    scroll_y = step_y * scrollable_data.movement.y[1];
                }
                // apply scroll //
                if (scrollable_data.movement.x[0] !== 0 && scrollable_data.movement.x[1] !== 0) {
                    scrollable_data.scrollable.scrollLeft = scroll_x + scrollable_data.scrollable_start_scroll_x;
                }
                if (scrollable_data.movement.y[0] !== 0 && scrollable_data.movement.y[1] !== 0) {
                    scrollable_data.scrollable.scrollTop = scroll_y + scrollable_data.scrollable_start_scroll_y;
                }
            }
        }
        else {
            // clean obsolete scrollable_data (as its relevant dom has been destroyed) //
            draggable_data.scrollable_data_array.splice(i, 1);
        }
    }
}
function _dragEnd(event) {
    const draggable = window.__DragScroll.active_draggable;
    const map = window.__DragScroll.draggable_to_draggable_data_map;
    const draggable_data = map.get(draggable);
    document.removeEventListener('mousemove', _drag);
    document.removeEventListener('mouseup', _dragEnd);
    // use custom hook //
    if (draggable_data.hooks?.dragEnd) {
        draggable_data.hooks?.dragEnd(event, draggable, draggable_data);
    }
}
export default dragScroll;