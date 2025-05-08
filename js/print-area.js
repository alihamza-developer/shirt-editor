let state = {};
// Load Image
function loadImage(src) {
    return new Promise(async (res, rej) => {
        let img = new Image();
        img.src = src;
        img.onload = function () {
            res(img);
        }
    });
}


(async () => {
    let $container = $(".shirt-container"),
        img = await loadImage("./images/shirts/black.jpg"),
        SHIRT_WIDTH = img.width,
        SHIRT_HEIGHT = img.height;

    $container.css({
        width: SHIRT_WIDTH,
        height: SHIRT_HEIGHT
    });
    $container.find("img").attr('src', img.src)
    $(".print-area-controls").draggable();

})();

function drawPrintArea(data) {
    let { top, left, width, height } = data,
        $printArea = $('.print-area');

    $printArea.css({
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        height: `${height}px`
    });
    state = {
        top: parseInt(top),
        left: parseInt(left),
        width: parseInt(width),
        height: parseInt(height)
    };
    $(".export-scale-inp").trigger("input");

}


// Print Area form
$(document).on("input", ".single-control input[type='range']", function () {
    let $form = $('.print-area-form'),
        data = parseFormData($form.serializeArray());
    drawPrintArea(data);

    for (const key in data) {
        let $inp = $(`.single-control[data-type="${key}"] .pull-away input`);
        $inp.val(data[key]);
    }
});

// Print Area form
$(document).on("change", ".single-control input[type='range']", function () {
    let $form = $('.print-area-form'),
        data = parseFormData($form.serializeArray());
    drawPrintArea(data);
});

// Change Inp
$(document).on("input", ".single-control .pull-away input", function () {
    let val = $(this).val(),
        $parent = $(this).parents(".single-control").first(),
        $inp = $parent.find("input[type='range']");

    $inp.val(val);
    $inp.trigger('change');
});


// Export Btn
$(document).on("click", ".export-btn", function () {

    let SHIRT_DATA = {
        EXPORT_SCALE: parseInt($('.export-scale-inp').val()),
        printArea: state
    }

    console.log(SHIRT_DATA);
});

// Export Scale Inp
$(document).on("input", ".export-scale-inp", function () {
    let scale = parseInt($(this).val()),
        { width, height } = state;
    let EXPORT_WIDTH = scale * width,
        EXPORT_HEIGHT = scale * height;
    if (EXPORT_WIDTH < width || EXPORT_HEIGHT < height) return false;
    $('.dims .width').val(EXPORT_WIDTH);
    $('.dims .height').val(EXPORT_HEIGHT);
});