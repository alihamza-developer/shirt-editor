//#region Active Object control properties change
fabric.Object.prototype.transparentCorners = false;
fabric.Object.prototype.borderColor = '#007bff';
fabric.Object.prototype.borderScaleFactor = 0.5;
fabric.Object.prototype.cornerStrokeColor = '#007bff';
fabric.Object.prototype.cornerColor = '#fff';
fabric.Object.prototype.cornerStyle = 'circle';
fabric.Object.prototype.cornerSize = 10;
fabric.Object.prototype.padding = 0;

let rotateIcon = "./images/editor-icons/rotate-icon.svg",
    imageDataRotate = document.createElement('img');
imageDataRotate.src = rotateIcon;
// here's where your custom rotation control is defined
fabric.Object.prototype.controls.mtr = new fabric.Control({
    x: 0,
    y: 0.5,
    offsetY: 30,
    cursorStyle: 'grab',
    actionHandler: fabric.controlsUtils.rotationWithSnapping,
    actionName: 'rotate',
    cornerSize: 12,
    withConnection: true
});

fabric.Object.prototype._controlsVisibility = {
    tl: true,
    tr: true,
    br: true,
    bl: true,
    ml: false,
    mt: false,
    mr: false,
    mb: false,
    mtr: true
};