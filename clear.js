const fs = require("fs");
const path = require("path");

const distPath = path.resolve("dist");

if (fs.existsSync(distPath)) {
    fs.rmdirSync(distPath, {
        recursive: true,
    })
}