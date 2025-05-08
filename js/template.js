const EXPORT_KEYS = ['originalItem', 'maxWidth', 'maxHeight', "src", "_stateProperties", 'percentage', 'id'];
let TEMPLATE_SAVING = true;
//or you register with key/value pairs
canvas.on({
    'object:added': saveTemplate,
    'object:modified': saveTemplate,
    'object:removed': saveTemplate,
    'object:moving': saveTemplate,
    'object:rotating': saveTemplate,
    'object:scaling': saveTemplate,
});

// Upload canvas object images
function UploadImages() {
    return new Promise(async (resolve, rej) => {
        let files = [],
            data = new FormData();
        data.append('uploadEditorImages', true);

        for (let i = 0; i < canvas._objects.length; i++) {
            const obj = canvas._objects[i];

            if (obj.originalItem.class === "image") {
                let src = obj.getSrc(),
                    file = await dataURLtoFile(src, `${obj.id}.png`);
                if (file) {
                    file.objId = obj.id;
                    files.push(file);
                    data.append('file[]', file);
                }
            }
        }
        if (!files.length) return resolve(true);

        // Send Ajax to Upload Images to server
        $.ajax({
            type: "POST",
            url: "editor",
            data: data,
            dataType: "json",
            contentType: false,
            processData: false,
            success: async function (response) {
                let uploadedFiles = response.data;

                for (let i = 0; i < files.length; i++) {
                    let file = files[i],
                        filepath = uploadedFiles[i].filepath,
                        obj = canvas._objects.find(obj => obj.id == file.objId);

                    if (obj) {
                        obj.originalItem.src = filepath;
                        obj.set('src', filepath);

                        await new Promise(async (res, rej) => {
                            obj.setSrc(filepath, function () {
                                canvas.renderAll();
                                res(true);
                            });
                        });
                    }
                }

                canvas.renderAll();
                resolve(true);
            }
        });
        resolve(true);
    });
}

// Save Design 
function SendToServer() {
    return new Promise(async (resolve, rej) => {
        let objects = canvas._objects;

        // Making curve text as a image 
        objects.forEach((obj, i) => {
            canvas._objects[i].originalItem.src = obj.toDataURL("image/png");
        });

        await UploadImages(); // Upload Images to server


        let design = canvas.toJSON(EXPORT_KEYS),
            thumbnail = await dataURLtoFile(canvas.toDataURL('image/png'), 'design.png'),
            data = new FormData();

        data.append('saveDesign', true);
        data.append('thumbnail', thumbnail);
        data.append('design', JSON.stringify(design));
        data.append("dimentions", JSON.stringify({
            width: canvas.width,
            height: canvas.height
        }));

        $.ajax({
            type: "POST",
            url: "editor",
            data: data,
            dataType: "json",
            contentType: false,
            processData: false,
            success: function (res) {
                resolve(true);
            },
            error: function () {
                resolve(true);
            }
        });
    });

}

// Save template
function saveTemplate() {
    return new Promise(async (res, rej) => {
        if (!TEMPLATE_SAVING) return res(true);

        let template = canvas.toJSON(EXPORT_KEYS),
            thumbnail = canvas.toDataURL('image/png'),
            id = "template",
            template_ = await DB.get("templates", id);

        if (template_) await DB.delete("templates", id);

        template.id = id;
        template.thumbnail = thumbnail;
        template.color = $('.shirt-image').attr('src');

        await DB.insert("templates", template);
        res(true);
    });
}

// Load Canvas
function loadCanvas(data) {
    return new Promise(async (res, rej) => {

        canvas.clear();

        let CurvedText = [],
            { objects } = data;

        // Filter Curve Text
        objects.map((obj, i) => {
            if (obj.type === 'curved-text') {
                CurvedText.push({ obj, index: i });
                objects.splice(i, 1);
            }
            obj.id = getRand(30);
        });

        data.objects = objects;

        canvas.loadFromJSON(data, function () {
            // Add Curve Text
            CurvedText.forEach(item => {
                let { obj, index } = item,
                    text = new fabric.CurvedText(obj.text, obj);
                canvas.add(text);
                text.moveTo(index);
                canvas.renderAll();
            });

            // Apply Width Height
            canvas._objects.forEach(obj => {
                if (obj.type === 'image')
                    applyMaxWidthAndHeight(obj, obj.maxWidth, obj.maxHeight, true);
            });

            canvas.renderAll();
            res(true);
        });
    });
}

// Choose template btn 
$(document).on("click", ".choose-template-btn", async function () {
    let template = await DB.get("templates", "template");
    if (!template) return false;
    delete template.id;
    delete template.thumbnail;


    await loadCanvas(template);

    $(".template-popup").removeClass('active');
});

// Close Template Popup
$(document).on("click", ".close-template-popup", function () {
    $(".editing-mode[data-type='shirt'] .colors-con .list .single-color").first().trigger("click"); // Active first t shirt color
    $('.template-popup').removeClass('active');
});

// Show Template Popup
$(document).ready(async function () {
    let template = await DB.get("templates", "template"),
        $popup = $(".template-popup");

    if (!template) {
        $(".close-template-popup").trigger("click");
        return false;
    }

    let { thumbnail, objects, color } = template;

    $('.shirt-image').attr('src', color);

    if (!objects.length) {
        $(".close-template-popup").trigger("click");
        return false;
    }

    $popup.find('.template-image').attr('src', thumbnail);
    $popup.addClass('active');
});