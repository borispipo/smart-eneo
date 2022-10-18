// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

const fs = require("fs");
const path = require("path");
const dir = path.resolve(__dirname)
const devExpoUIPath = path.resolve(dir,"expo-ui");
///retourne le chemin vers le package @expo-ui
module.exports = ()=>{
    const isDev = fs.existsSync(devExpoUIPath) && fs.existsSync(path.resolve(devExpoUIPath,"babel.config.alias.js"))
    && fs.existsSync(path.resolve(devExpoUIPath,"src"));
    const isDevFile = path.resolve(dir,"isDev.js");
    try {
        var writeStream = fs.createWriteStream(isDevFile);
        writeStream.write("const isDev="+(isDev?"true":"false")+";\nexport default isDev;");
        writeStream.end();
    } catch{
        if(fs.existsSync(isDevFile)){
            try {
                fs.rmSync(isDevFile);
            } catch{}
        }
    }
    return isDev ? "./expo-ui" : "@fto-consult/expo-ui";
}