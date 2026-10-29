// Size packaging only: re-encode real large JPEG captures, without compositing,
// cropping, resizing or changing the depicted UI/engine state. Keep every capture.
import fs from'node:fs/promises';import path from'node:path';import{createRequire}from'node:module';
const sharp=createRequire(import.meta.url)(process.env.STRATOKS_SHARP??'/tmp/stratoks-art/node_modules/sharp');
const root=path.resolve(import.meta.dirname,'../../artifacts/living-interface'),results=[];
for(const file of await fs.readdir(root)){
 if(!file.endsWith('.jpg'))continue;
 const original=await fs.readFile(path.join(root,file));if(original.length<80000)continue;
 const encoded=await sharp(original).jpeg({quality:45,chromaSubsampling:'4:2:0'}).toBuffer();
 if(encoded.length>=original.length)continue;
 await fs.writeFile(path.join(root,file),encoded);results.push({file,before:original.length,after:encoded.length});
}
const report={processing:'JPEG quality-45 packaging of large actual browser captures only; dimensions/content unchanged. No capture dropped.',bytesSaved:results.reduce((a,r)=>a+r.before-r.after,0),results};
await fs.writeFile(path.join(root,'evidence-encoding.json'),JSON.stringify(report,null,2)+'\n');console.log(report);
