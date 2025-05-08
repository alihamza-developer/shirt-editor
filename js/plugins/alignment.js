// Set Object Alignment
function AlignObject(val, obj = canvas.getActiveObject()) {
    let width = canvas.width,
        height = canvas.height;
    if (!obj) return false;

    switch (val) {
        case 'left':
            obj.set({
                left: 0,
                align: "left"
            });
            break;
        case 'right':
            obj.set({
                left: width - obj.getScaledWidth(),
                align: "right"
            });
            break;
        case 'top':
            obj.set({
                top: 0,
            });
            break;
        case 'bottom':
            obj.set({
                top: height - obj.getScaledHeight()
            });
            break;
        case 'center':
            AlignObject("centerV", obj);
            AlignObject("centerH", obj);
            break;
        case 'centerH':
            obj.set({
                left: (width / 2) - (obj.getScaledWidth() / 2),
                align: "centerH"
            });
            break;

        case 'centerV':
            obj.set({
                top: (height / 2) - (obj.getScaledHeight() / 2)
            });
            break;
    }
    canvas.renderAll();
}
