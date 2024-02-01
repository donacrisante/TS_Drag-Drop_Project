//Drag & Drop Interfaces
  export interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
  }

  export interface DragTarget {
    dragOverHandler(event: DragEvent): void; //Permits the drop: When implementing drag&drop in JS we signal the browser in JS that the thing we are dragging something over is a valid drag target. If we don't do the right thing in the dragOverHandler, droping won't be possible.
    dropHandler(event: DragEvent): void; // Handles the drop: We need dropHandler to react to the actual drop that happens.
    dragLeaveHandler(event: DragEvent): void; // Can be useful, if we want for example to give some visual feedback to the user. When the user drags something over the box, for example when he changes the background color.
  }

