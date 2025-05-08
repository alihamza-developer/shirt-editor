
function mergePath(...paths) {
    let url = '';
    paths.forEach(path => {
        path = trim(path);
        path = trim(path, '/');
        if (path.length) url += `/${path}`;
    });
    url = trim(url, '/');
    return url;
}

function trim(str, charlist) {
    let whitespace = [' ', '\n', '\r', '\t', '\f', '\x0b', '\xa0', '\u2000', '\u2001', '\u2002', '\u2003', '\u2004', '\u2005', '\u2006', '\u2007', '\u2008', '\u2009', '\u200a', '\u200b', '\u2028', '\u2029', '\u3000'].join('')
    let l = 0
    let i = 0
    str += ''
    if (charlist) {
        whitespace = (charlist + '').replace(/([[\]().?/*{}+$^:])/g, '$1')
    }
    l = str.length
    for (i = 0; i < l; i++) {
        if (whitespace.indexOf(str.charAt(i)) === -1) {
            str = str.substring(i)
            break
        }
    }
    l = str.length
    for (i = l - 1; i >= 0; i--) {
        if (whitespace.indexOf(str.charAt(i)) === -1) {
            str = str.substring(0, i + 1)
            break
        }
    }
    return whitespace.indexOf(str.charAt(0)) === -1 ? str : ''
}

// Craete random key
function getRand(len) {
    let chars = "adeh9i8jklw6xo4bcmnp5q2rs3tu1fgv7yz0ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        key = "";
    for (let i = 0; i < len; i++) {
        key += chars[Math.floor(Math.random() * ((chars.length - 1) + 1))];
    }
    return key;
}

function showErrorMsg(active = true) {
    if (active) {
        $('.error-msg').addClass("active");
        setTimeout(() => {
            $('.error-msg').removeClass('active');
        }, 3000);
    } else $('.error-msg').removeClass("active");
}

// Load Image
function loadImage(src) {
    return new Promise(async (res, rej) => {
        let img = new Image();
        img.src = src;
        img.crossOrigin = "anonymous";
        img.onload = function () {
            res(img);
        }
    });
}


function downloadImage(imageSrc, fileName = "image") {
    return new Promise((resolve, reject) => {
        fetch(imageSrc)
            .then(response => {
                if (!response.ok) throw new Error("Failed to fetch image");
                return response.blob();
            })
            .then(blob => {
                const url = URL.createObjectURL(blob);
                const anchor = document.createElement("a");
                anchor.href = url;
                anchor.download = fileName;
                document.body.appendChild(anchor);
                anchor.click();
                document.body.removeChild(anchor);
                URL.revokeObjectURL(url); // Clean up URL
                resolve("Download successful");
            })
            .catch(error => reject(error));
    });
}

// To Base 64
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
});

// canvas data url to file
async function dataURLtoFile(dataurl, filename) {
    if (!dataurl.includes("base64")) {
        let response = await fetch(dataurl),
            data = await response.blob(),
            metadata = {
                type: 'image/jpeg'
            };
        let file = new File([data], filename, metadata);
        return file;
    }
    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {
        type: mime
    });
}

// Parse Form Data
function parseFormData(data) {
    let final = {};
    data.forEach(item => {
        final[item.name] = item.value;
    })
    return final;
}

function pxToCm(px) {
    const dpi = 96,
        inches = px / dpi,
        cm = inches * 2.54;
    return cm;
}