// Active Shirt Color
$(document).on("click", ".editing-mode[data-type='shirt'] .colors-con .list .single-color", async function () {
    let color = $(this).attr('data-color'),
        $img = $(".preview-area img"),
        $colors = $(this).parents('.colors-con'),
        { name, src } = EDITOR.shirt.colors[color],
        path = mergePath("images/shirts", src),
        img = await loadImage(path);
    $img.attr("src", img.src);
    $colors.find('.selected-color').html(name);

    $colors.find('.single-color').removeClass('active');
    $(this).addClass("active");
    saveTemplate();
});

// Add Text Btn 
$(document).on("click", ".sidebar .add-text-btn", async function () {
    await AddItemToEditor({
        src: "My Text",
        type: "text",
    }, {
        fontFamily: "Amatic",
        fill: "#cba84b",
    });
    canvas.renderAll();
});

// Text Edit Inp
$(document).on("input", ".text-edit-input .text-edit-inp", function () {
    let val = $(this).val(),
        obj = canvas.getActiveObject();
    obj.set('text', val);
    obj._stateProperties.text = val;
    canvas.renderAll();
    saveTemplate();
});

// Alignment 
$(document).on("click", ".alignments .align-btn", function () {
    let type = $(this).attr("data-type");
    AlignObject(type);
    canvas.renderAll();
    $('.align-btn').removeClass('active');
    $(this).addClass('active');
    saveTemplate();
});


// Select font list
$(document).on("click", ".options-selector-panel#fontFamily .list .item", function () {
    let value = $(this).attr("data-value"),
        $fontFamily = $(".options-selector[data-target='fontFamily']"),
        $panel = $('.options-selector-panel#fontFamily'),
        obj = canvas.getActiveObject();
    if (!obj) return false;

    obj.set("fontFamily", value);
    canvas.renderAll();

    $fontFamily.find('.item').css("font-family", value);
    $fontFamily.find('.item').text(value);
    $panel.removeClass('active');
    saveTemplate();
});

// Apply Color to text
$(document).on("click", ".colors-con[data-type='text'] .list .single-color", function () {
    let color = $(this).attr('data-color'),
        obj = canvas.getActiveObject();
    obj.set("fill", color);
    canvas.renderAll();
    saveTemplate();
});

// Upload Image
$(document).on("change", ".upload-image", async function () {
    let file = this.files[0];
    if (!isImageFile(file)) {
        $('.error-msg').removeClass('active');
        $('.error-msg.image-type').addClass('active');
        setTimeout(() => {
            $('.error-msg').removeClass('active');

        }, 3000);
        return true;
    }

    let src = await toBase64(file),
        img = await loadImage(src),
        { width, height } = calculateImageDims(img),
        obj = await AddItemToEditor({
            src: img.src,
            originalSrc: src,
            filename: file.name,
            type: "image",
            fileType: "image",
            userImage: true,
        });

    applyMaxWidthAndHeight(obj, width, height);
    AlignObject("center", obj);
    canvas.renderAll();
    $(this).val("");
    showObjPropsNav(obj);
});

// On Moving
canvas.on("object:moving", e => {
    showObjPropsNav(e.target, true);
});

// Delete Obj
$(document).on("click", ".remove-obj", function () {
    let obj = canvas.getActiveObject();
    canvas.remove(obj);
    canvas.renderAll();
    showObjPropsNav(false);
});

// Move Obj
$(document).on("click", ".move-obj", function () {
    let obj = canvas.getActiveObject(),
        type = $(this).attr('data-type');

    canvas.discardActiveObject()
    canvas.renderAll();
    showObjPropsNav(false);

    if (type == 'up') canvas.bringForward(obj);
    else canvas.sendBackwards(obj);

    canvas.renderAll();
    saveTemplate();
});

// Reset Obj
$(document).on("click", ".reset-obj", function () {
    let obj = canvas.getActiveObject(),
        TEXT_TYPES = ['text', 'i-text', 'curved-text']
    if (!obj) return false;

    let { type, originalItem } = obj,
        item = originalItem;

    obj.set("angle", 0);
    canvas.renderAll();


    // Image Reset
    if (type == 'image') {
        applyMaxWidthAndHeight(obj, obj.maxWidth, obj.maxHeight);
        if (item.hasOwnProperty("design")) obj.scaleToWidth(canvas.width / 3);
    }

    // Reset Text Types
    if (TEXT_TYPES.includes(type)) {
        // Curved Text
        if (type == 'curved-text') {
            let text = new fabric.Text(obj.text, obj._stateProperties);
            canvas.add(text);
            AlignObject('center', text);
            canvas.remove(obj);
        }

        obj.set({
            ...obj._stateProperties
        });
    }

    AlignObject('center', obj);
    showObjPropsNav(obj);
    saveTemplate();
});

// Zoom in/ out
$(document).on("click", ".zoom-btn", function () {
    $(this).toggleClass('active');
    $('.preview-area').toggleClass('zoom');
});

//#region Color Picker

let colorPicker = new iro.ColorPicker(".color-picker", {
    width: 200,
    color: "rgb(255, 0, 0)",
    borderWidth: 1,
    borderColor: "#fff",
    layout: [
        {
            component: iro.ui.Box,
        },
        {
            component: iro.ui.Slider,
            options: {
                id: 'hue-slider',
                sliderType: 'hue',
            }
        }
    ]
});

colorPicker.on('color:change', function (color) {
    let $inp = $('.color-picker-code');
    $inp.val(color.hexString);
});

// Apply Color 
$(document).on("click", ".apply-color-btn", function () {
    let color = $('.color-picker-code').val(),
        obj = canvas.getActiveObject();
    if (!obj) return false;
    if (!color) return false;
    let textTypes = ['text', 'i-text', 'curved-text'];

    if (!textTypes.includes(obj.type)) return false;
    obj.set("fill", color);
    canvas.renderAll();

    $('.options-selector-panel#colorPicker').removeClass('active');
    saveTemplate();
});
//#endregion Color Picker 


//#region Responsive Text Toggles

// Toggle Text Tool
function toggleTextTool(type) {
    let $text = $('.editing-mode[data-type="text"]'),
        $tool = $text.find(`.single-tool#${type}`),
        $items = $('.sidebar .items');
    $('.options-selector-panel').removeClass('active');
    $items.find('.item').removeClass('active');
    $items.find(`.item[data-type="${type}"]`).addClass('active');
    $text.find('.single-tool').removeClass('active');
    $tool.addClass("active");

    let headings = {
        'color': "Colors",
        'fontFamily': "Select Font",
        "editText": "Edit Text",
        "alignment": "Alignment & Curve Text"
    },
        heading = headings[type];
    $('.tool-header .title').text(heading);
}

$(document).on("click", ".close-color-btn", function () {
    toggleTextTool("color");
});
$(document).on("click", ".sidebar .items[data-type='text'] .item", function () {
    let type = $(this).attr("data-type");
    toggleTextTool(type);
});
$(document).ready(function () {
    if (IS_MOBILE)
        toggleTextTool('color');
});
//#endregion Responsive Text  Toggles