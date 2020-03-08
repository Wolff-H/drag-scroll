# drag-scroll

## install

### npm
$ npm install @wolff-h/drag-scroll

### &lt;script&gt; // as a module

&lt;script src="somepath/drag-scroll.js"&gt;&lt;/script&gt;

### &lt;script&gt; // plain js

&lt;script src="somepath/drags-croll.js"&gt;&lt;/script&gt;  
// delete the export sentence

## usage

Notice: the target element must have a position defined

### basic
    import dragScroll from '@wolff-h/drag-scroll'

    dragScroll({
        element: target_element,
        container: target_container,
    })