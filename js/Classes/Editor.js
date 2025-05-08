class Editor {
    shirt = null;
    canvas = null;
    // Constructor
    constructor(shirt) {
        this.init(shirt)
    }
    // Init
    init(shirt) {
        this.shirt = shirt;

        this.initCanvas(); // Init Canvas
        this.loadColors(); // Load shirt Colors
    }

    // Init Canvas
    initCanvas() {
        let { width, height, top, left } = this.shirt.printArea;

        this.canvas = new fabric.Canvas("printArea", {
            width,
            height,
            centeredScaling: true,
            backgroundColor: "transparent"
        });

        $('.canvas-container').css({
            top: `${top}px`,
            left: `${left}px`
        });
    }

    // Load Colors
    loadColors() {
        let $con = $(".editing-tools .editing-mode[data-type='shirt']"),
            colors = '';

        for (let color in this.shirt.colors) {
            colors += `<div style="background:${color};" data-color="${color}" class="single-color"></div>`;
        }

        $con.find(".list").html(colors);
    }

    // Load Fonts
    async loadFonts() {
        let $list = $('.options-selector-panel#fontFamily .list'),
            html = '';

        // Fonts
        for (const name in FONTS) {
            let src = FONTS[name],
                font_ = new FontFace(name, `url(./css/fonts/${src})`);
            await font_.load();
            document.fonts.add(font_);

            html += `<div class="item" data-value="${name}" style="font-family:${name}">${name}</div>`;
        }

        $list.html(html);
    }
}

const EDITOR = new Editor(SHIRT_DATA);
canvas = EDITOR.canvas;

(async () => {
    await EDITOR.loadFonts();
})();

// Draw Print Area
function DrawPrintArea() {
    let IMAGE_DIMS = getShirtDims(),
        IMG_WIDTH = IMAGE_DIMS.width,
        IMG_HEIGHT = IMAGE_DIMS.height,
        SHIRT_WIDTH = SHIRT_DATA.width,
        SHIRT_HEIGHT = SHIRT_DATA.height,
        { EXPORT_SCALE, printArea } = SHIRT_DATA,
        { top, left, width, height } = printArea,
        scaleX = IMG_WIDTH / SHIRT_WIDTH,
        scaleY = IMG_HEIGHT / SHIRT_HEIGHT,
        dims = {
            top: top * scaleY,
            left: left * scaleX,
            width: width * scaleX,
            height: height * scaleY
        };

    $('.canvas-container').css({
        top: `${dims.top}px`,
        left: `${dims.left}px`
    });

    canvasDimensions.orgWidth = width * EXPORT_SCALE;
    canvasDimensions.orgHeight = height * EXPORT_SCALE;
    canvasDimensions.resizedWidth = width * EXPORT_SCALE;
    canvasDimensions.resizedHeight = height * EXPORT_SCALE;

    resizeCanvas({ width: dims.width, height: dims.height });
}

document.querySelector(".shirt-image").onload = DrawPrintArea;