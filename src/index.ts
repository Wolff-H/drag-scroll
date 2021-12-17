interface Movement
{
    x: [drag_trigger_threshold: number, scroll_respond_vector: number]
    y: [drag_trigger_threshold: number, scroll_respond_vector: number]
    swapped: boolean
}

interface Options
{
    movement: Movement
    destroy: boolean
    override: boolean
    avoid: HTMLElement[]
    constrained: boolean
    hooks: DraggableData["hooks"]
}

interface DragScrollData
{
    tool_name: string
    description: string
    draggable_to_draggable_data_map: DraggableToDraggableDataMap
    active_draggable: HTMLElement|null
}

type DraggableToDraggableDataMap = WeakMap<HTMLElement, DraggableData>

interface DraggableData
{
    mouse_start_x: number
    mouse_start_y: number
    avoid: HTMLElement[]
    scrollable_data_array: ScrollableData[]
    hooks:
    {
        dragStart?: (event: MouseEvent, draggable: HTMLElement, draggable_data: DraggableData) => void|false
        drag?: (event: MouseEvent, draggable: HTMLElement, draggable_data: DraggableData) => void|false
        dragEnd?: (event: MouseEvent, draggable: HTMLElement, draggable_data: DraggableData) => void
    }
}

interface ScrollableData
{
    scrollable: HTMLElement
    scrollable_start_scroll_x: number
    scrollable_start_scroll_y: number
    movement: Movement
    constrained: boolean
}



/**
 * Offers ability of scrolling element by dragging.
 * @param draggable Draggable. The trigger element for dragscroll action.//拖拽物，即拖滚行为的触发者。
 * @param scrollable Scrollable. The Responsive element for dragscroll action.//     滚动物，即拖滚行为的响应者。如果传入null，则销毁该draggable的记录。
 * @param movement Movement constraint.//     运动配置。分别规定x轴、y轴的拖滚触发与响应行为，格式为[拖拽触发阈值，滚动响应矢量]。设置swapped为true令拖滚轴对换。设置constrained为true令拖滚行为只当鼠标在拖拽物上时才发生。传入一个avoid元素数组，拖滚将不会在这些元素上发生。
 * @param options Options.//其他配置。如果设定了override为true，则在该draggable下的scrollable的创建和更新将会覆写整个scrollable_data_array数组为仅含传入的这一个，否则，只会添加或更新传入的scrollable。
 */
function dragScroll(
    draggable: HTMLElement,
    scrollable: HTMLElement|null,
    options:
    {
        movement?:
        {
            x?: [number, number]
            y?: [number, number]
            swapped?: boolean
        },
        constrained?: boolean
        destroy?: boolean,
        override?: boolean,
        avoid?: HTMLElement[],
        hooks?:
        {
            dragStart?: (event: MouseEvent, draggable: HTMLElement, draggable_data: DraggableData) => void|false
            drag?: (event: MouseEvent, draggable: HTMLElement, draggable_data: DraggableData) => void|false
            dragEnd?: (event: MouseEvent, draggable: HTMLElement, draggable_data: DraggableData) => void
        }
    } = {},
){
    // defaults --------------------------------------------------------------------------------------------------------
    const default_movement: Movement =
    {
        x: [1, 1],
        y: [1, 1],
        swapped: false,
    }

    const default_options: Options =
    {
        movement: default_movement,
        destroy: false,
        override: false,
        avoid: [],
        constrained: false,
        hooks: {},
    }

    if(!window.__DragScroll)
    {
        window.__DragScroll =
        {
            tool_name: 'drag-scroll',
            description: 'Scroll elements corresponding to a drag behavior.',
            draggable_to_draggable_data_map: new WeakMap(),
            active_draggable: null,
        } as DragScrollData
    }

    const map: DraggableToDraggableDataMap = window.__DragScroll.draggable_to_draggable_data_map
    
    // composed params -------------------------------------------------------------------------------------------------
    const _options =
    {
        ...default_options,
        ...options,
        movement:
        {
            ...default_movement,
            ...options.movement,
        }
    }

    // take one desired action -----------------------------------------------------------------------------------------
    // #1. destroy - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // remove whole record //
    if(scrollable === null)
    {
        if(map.has(draggable))
        {
            map.delete(draggable)

            draggable.removeEventListener('mousedown', _dragStart)
        }

        return
    }

    // remove target scrollable //
    if(_options.destroy)
    {
        const draggable_data = map.get(draggable)

        if(draggable_data)
        {
            const { scrollable_data_array } = draggable_data

            const target_scrollable_data_index = scrollable_data_array.findIndex((scrollable_data) => {
                return scrollable_data.scrollable === scrollable
            })

            if(target_scrollable_data_index >= 0)
            {
                scrollable_data_array.splice(target_scrollable_data_index, 1)
            }
        }

        return
    }

    // #2. create - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
    if(!map.has(draggable))
    {
        map.set(
            draggable,
            {
                mouse_start_x: 0,
                mouse_start_y: 0,
                avoid: _options.avoid,
                hooks: _options.hooks,
                scrollable_data_array:
                [
                    {
                        scrollable: scrollable,
                        scrollable_start_scroll_x: 0,
                        scrollable_start_scroll_y: 0,
                        movement: _options.movement,
                        constrained: _options.constrained,
                    },
                ],
            }
        )

        draggable.addEventListener('mousedown', _dragStart)
    }
    // #3. update - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
    else
    {
        // override whole scrollable_data_array to only contain target scrollable_data //
        if(_options.override)
        {
            map.set(
                draggable,
                {
                    mouse_start_x: 0,
                    mouse_start_y: 0,
                    avoid: _options.avoid,
                    hooks: _options.hooks,
                    scrollable_data_array:
                    [
                        {
                            scrollable: scrollable,
                            scrollable_start_scroll_x: 0,
                            scrollable_start_scroll_y: 0,
                            movement: _options.movement,
                            constrained: _options.constrained,
                        },
                    ],
                }
            )
        }
        // update target scrollable_data in scrollable_data_array //
        else if(map.has(draggable))
        {
            const draggable_data = map.get(draggable)
            /*
                !!! TODO： update should be a brand new initialization
            */
            if(draggable_data)
            {
                draggable_data.avoid = _options.avoid

                const target_scrollable_data = draggable_data.scrollable_data_array.find((scrollable_data) => {
                    return scrollable_data.scrollable === scrollable
                })

                if(target_scrollable_data)
                {
                    target_scrollable_data.movement = _options.movement
                    // target_scrollable_data.constrained = _options.constrained
                }
            }
        }
        // add the passed scrollable_data as a new one to scrollable_data_array //
        else
        {
            const draggable_data = map.get(draggable)

            if(draggable_data)
            {
                draggable_data.scrollable_data_array.push(
                    {
                        scrollable: scrollable,
                        scrollable_start_scroll_x: 0,
                        scrollable_start_scroll_y: 0,
                        movement: _options.movement,
                        constrained: _options.constrained,
                    }
                )
            }
        }
    }
}

function _dragStart(this: HTMLElement, event: MouseEvent)
{ 
    const draggable = this
    const map: DraggableToDraggableDataMap = window.__DragScroll.draggable_to_draggable_data_map
    const draggable_data = map.get(draggable)!

    // use custom hook //
    if(draggable_data.hooks?.dragStart && draggable_data.hooks?.dragStart(event, draggable, draggable_data) === false) return

    // drag starts only when not mousedown on avoid //
    if(!draggable_data.avoid.includes(event.target as HTMLElement))
    {
        draggable_data.mouse_start_x = event.clientX
        draggable_data.mouse_start_y = event.clientY
    
        // initialize scrollable_data_array //
        for(const scrollable_data of draggable_data.scrollable_data_array)
        {
            const { scrollable } = scrollable_data
            
            scrollable_data.scrollable_start_scroll_x = scrollable.scrollLeft
            scrollable_data.scrollable_start_scroll_y = scrollable.scrollTop
        }
    
        window.__DragScroll.active_draggable = draggable
    
        document.addEventListener('mousemove', _drag)
        document.addEventListener('mouseup', _dragEnd)
    }
}

function _drag(event: MouseEvent)
{
    const draggable = window.__DragScroll.active_draggable as HTMLElement
    const map: DraggableToDraggableDataMap = window.__DragScroll.draggable_to_draggable_data_map
    const draggable_data = map.get(draggable)!

    // use custom hook //
    if(draggable_data.hooks?.drag && draggable_data.hooks?.drag(event, draggable, draggable_data) === false) return

    let i = draggable_data.scrollable_data_array.length

    while(i--)
    {
        const scrollable_data = draggable_data.scrollable_data_array[i]

        if(scrollable_data.scrollable)    // check if the scrollable is obsolete
        {
            if(!scrollable_data.constrained || event.target === draggable)
            {
                // drag_trigger_threshold (1 threshold triggers 1 step) //
                const step_x = Math.ceil((draggable_data.mouse_start_x - event.clientX) / scrollable_data.movement.x[0])
                const step_y = Math.ceil((draggable_data.mouse_start_y - event.clientY) / scrollable_data.movement.y[0])
        
                // scroll_respond_vector //
                let scroll_x = 0, scroll_y = 0
        
                if(scrollable_data.movement.swapped)
                {
                    scroll_x = step_y * scrollable_data.movement.y[1]
                    scroll_y = step_x * scrollable_data.movement.x[1]
                }
                else
                {
                    scroll_x = step_x * scrollable_data.movement.x[1]
                    scroll_y = step_y * scrollable_data.movement.y[1]  
                }
        
                // apply scroll //
                if(scrollable_data.movement.x[0] !== 0 && scrollable_data.movement.x[1] !== 0)
                {
                    scrollable_data.scrollable.scrollLeft = scroll_x + scrollable_data.scrollable_start_scroll_x
                }
                if(scrollable_data.movement.y[0] !== 0 && scrollable_data.movement.y[1] !== 0)
                {
                    scrollable_data.scrollable.scrollTop = scroll_y + scrollable_data.scrollable_start_scroll_y
                }
            }
        }
        else
        {
            // clean obsolete scrollable_data (as its relevant dom has been destroyed) //
            draggable_data.scrollable_data_array.splice(i, 1)
        }
    }
}

function _dragEnd(event: MouseEvent)
{
    const draggable = window.__DragScroll.active_draggable as HTMLElement
    const map: DraggableToDraggableDataMap = window.__DragScroll.draggable_to_draggable_data_map
    const draggable_data = map.get(draggable)!

    document.removeEventListener('mousemove', _drag)
    document.removeEventListener('mouseup', _dragEnd)

    // use custom hook //
    if(draggable_data.hooks?.dragEnd)
    {
        draggable_data.hooks?.dragEnd(event, draggable, draggable_data)
    }
}



export default dragScroll