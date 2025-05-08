// Export Design 
function ExportDesign() {
    let oldWidth = canvas.width,
        oldHeight = canvas.height,
        { orgWidth, orgHeight } = canvasDimensions;

    // Resize canvas to new print area size
    resizeCanvas({
        width: orgWidth,
        height: orgHeight
    });

    let scaleX = orgWidth / oldWidth,
        scaleY = orgHeight / oldHeight;

    // Apply uniform scaling
    canvas.getObjects().forEach(obj => {
        obj.scaleX *= scaleX;
        obj.scaleY *= scaleY;
        obj.left *= scaleX;
        obj.top *= scaleY;
        obj.setCoords();
    });

    canvas.renderAll();

    // Export image
    let design = canvas.toDataURL("image/png", {
        quality: 1
    });

    downloadImage(design, "design.png");

    // Revert to original canvas size
    resizeCanvas({
        width: oldWidth,
        height: oldHeight
    });

    scaleX = oldWidth / orgWidth;
    scaleY = oldHeight / orgHeight;

    canvas.getObjects().forEach(obj => {
        obj.scaleX *= scaleX;
        obj.scaleY *= scaleY;
        obj.left *= scaleX;
        obj.top *= scaleY;
        obj.setCoords();
    });

    canvas.renderAll();

    return design;
}

// Export Shirt
function ExportShirt(design) {
    return new Promise(async (res, rej) => {
        let shirt = await loadImage($('.shirt-image').attr('src')),
            shirtCanvas = document.createElement('canvas'),
            { printArea } = SHIRT_DATA,
            { width, height } = shirt;
        shirtCanvas.width = width;
        shirtCanvas.height = height;

        let ctx = shirtCanvas.getContext('2d');
        ctx.drawImage(shirt, 0, 0, width, height);

        // Draw Design on Tshirt
        design = await loadImage(design);
        ctx.drawImage(design, printArea.left, printArea.top, printArea.width, printArea.height);

        shirt = shirtCanvas.toDataURL();
        downloadImage(shirt, "shirt.jpg");

        res(shirt);
    });
}


// Export Shirt
$(document).on("click", ".export-design-btn", async function () {
    TEMPLATE_SAVING = false;
    let design = ExportDesign();

    await ExportShirt(design);


    TEMPLATE_SAVING = true;
    await SendToServer(); // Sending Design to server 
    toggleDesignPopup(false);

    saveTemplate();
});
