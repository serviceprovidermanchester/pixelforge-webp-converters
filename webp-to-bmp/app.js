"use strict";
const CONFIG = {"source": "WEBP", "target": "BMP", "slug": "webp-to-bmp", "acceptedExtensions": ["webp"]};
const $ = id => document.getElementById(id);
const input = $('file-input'), drop = $('dropzone'), queueEl = $('queue'), resultsEl = $('results-list');
const files = [], converted = [];
const state = {busy:false};
const EXT = {PNG:'png',JPG:'jpg',WEBP:'webp',GIF:'gif',BMP:'bmp',ICO:'ico',SVG:'svg',AVIF:'avif',PDF:'pdf',BASE64:'txt'};
const MIME = {PNG:'image/png',JPG:'image/jpeg',WEBP:'image/webp',GIF:'image/gif',BMP:'image/bmp',ICO:'image/x-icon',SVG:'image/svg+xml',AVIF:'image/avif'};
const readable = n => n > 1048576 ? (n/1048576).toFixed(2)+' MB' : (n/1024).toFixed(1)+' KB';
const escapeHTML = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let lastStatus = '';
function status(s){lastStatus=s;$('status-text').textContent=s;}
function dataURLtoBlob(data) {
  const m = /^data:([^;,]+)?(;base64)?,([\s\S]*)$/i.exec(data.trim());
  if(!m) throw Error('Paste a complete Base64 data URL (data:image/png;base64,...).');
  const mime=m[1]||'image/png';
  if(!/^image\/(?:png|jpeg|jpg|webp|gif|bmp|svg\+xml|avif|x-icon|vnd\.microsoft\.icon)$/.test(mime)) throw Error('The Base64 data must represent an image.');
  const text=m[2]?atob(m[3].replace(/\s/g,'')):decodeURIComponent(m[3]);
  const arr=new Uint8Array(text.length);for(let i=0;i<text.length;i++)arr[i]=text.charCodeAt(i);
  return new Blob([arr],{type:mime});
}
function base64QueueFile(file){return file.name.toLowerCase().endsWith('.txt')||file.name.toLowerCase().endsWith('.b64');}
async function addFiles(list) {
  let added=0;
  for(const file of list){
    if(file.size>25*1024*1024){status('Skipped '+file.name+': limit is 25 MB');continue;}
    if(CONFIG.source==='BASE64') {
      if(!base64QueueFile(file)){status('Please choose a .txt or .b64 text file');continue;}
      const text=await file.text();
      try{const b=dataURLtoBlob(text); files.push({file:b,name:file.name.replace(/\.(txt|b64)$/i,'.png'), originalFile:file});added++}
      catch(e){status(e.message)}
    } else {
      const actual = file.name.split('.').pop().toLowerCase();
      if(!CONFIG.acceptedExtensions.includes(actual) && file.type!==MIME[CONFIG.source]) {status('Skipped '+file.name+': choose a '+CONFIG.source+' file');continue;}
      files.push({file,name:file.name,originalFile:file});added++;
    }
  }
  if(added) status(added+' file(s) ready to convert');
  renderQueue();
}
function makeThumb(file){const obj=URL.createObjectURL(file);return obj;}
function renderQueue(){
  queueEl.innerHTML='';
  $('queue-count').textContent=files.length;
  $('clear-btn').disabled=!files.length||state.busy;
  $('convert-btn').disabled=!files.length||state.busy;
  if(!files.length){queueEl.innerHTML='<div class="empty-state">Files you add will appear here.</div>';return}
  files.forEach((entry,i)=>{
    const row=document.createElement('div');row.className='queue-item';
    const thumb=document.createElement('img');thumb.className='thumb';thumb.alt='';
    const u=makeThumb(entry.file);thumb.src=u;thumb.onload=()=>URL.revokeObjectURL(u);thumb.onerror=()=>URL.revokeObjectURL(u);
    const detail=document.createElement('div');detail.className='file-details';detail.innerHTML='<strong>'+escapeHTML(entry.name)+'</strong><span>'+readable(entry.file.size)+'</span>';
    const button=document.createElement('button');button.className='remove-btn';button.textContent='×';button.title='Remove '+entry.name;
    button.setAttribute('aria-label','Remove '+entry.name);button.disabled=state.busy;
    button.onclick=()=>{files.splice(i,1);renderQueue()};
    row.append(thumb,detail,button);queueEl.append(row);
  });
}
function clearResults(){for(const entry of converted){URL.revokeObjectURL(entry.url)}converted.length=0;resultsEl.innerHTML='';$('results-section').hidden=true;}
$('clear-btn').onclick=()=>{files.length=0;input.value='';clearResults();renderQueue();status('Queue cleared')};
drop.addEventListener('click',()=>input.click());
drop.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();input.click()}});
drop.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('dragover')});
drop.addEventListener('dragleave',()=>drop.classList.remove('dragover'));
drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('dragover');addFiles(e.dataTransfer.files)});
input.addEventListener('change',e=>{addFiles(e.target.files);input.value=''});
$('size-select').onchange=()=>$('custom-box').hidden=$('size-select').value!=='custom';
$('quality').oninput=()=>$('quality-value').textContent=$('quality').value+'%';
if(CONFIG.source==='BASE64'){
 $('base64-area').hidden=false;
 $('add-base64').onclick=()=>{try{const b=dataURLtoBlob($('base64-text').value);if(b.size>25*1024*1024)throw Error('Maximum size is 25 MB');files.push({file:b,name:'pasted-image.png',originalFile:b});renderQueue();status('Pasted image added')}catch(e){status(e.message)}};
}
if(!['JPG','WEBP','PDF'].includes(CONFIG.target))$('quality-control').hidden=true;
function decodeImage(file){return new Promise((resolve,reject)=>{
 const url=URL.createObjectURL(file),img=new Image();
 img.onload=()=>{URL.revokeObjectURL(url);resolve(img)};
 img.onerror=()=>{URL.revokeObjectURL(url);reject(Error('Could not decode image; this browser may not support the source format.'))};
 img.src=url;
})}
function getDimensions(img){const w=img.naturalWidth||img.width,h=img.naturalHeight||img.height;
 if(!w||!h||w*h>36000000)throw Error('Image too large or unreadable (36 megapixel limit).');
 const opt=$('size-select').value;let width=opt==='custom'?Number($('custom-width').value):Math.round(w*Number(opt));
 if(!Number.isFinite(width)||width<1||width>16000)throw Error('Choose a valid width between 1 and 16000 px.');
 const height=Math.max(1,Math.round(width*h/w));
 if(width*height>36000000)throw Error('Output is above the 36 megapixel limit.');return [width,height]}
function canvasFor(img,target){const [w,h]=getDimensions(img),c=document.createElement('canvas');c.width=w;c.height=h;
 const cx=c.getContext('2d',{willReadFrequently:target==='BMP'});if(!cx)throw Error('Could not create canvas.');
 if(['JPG','BMP','PDF'].includes(target)){cx.fillStyle='#ffffff';cx.fillRect(0,0,w,h)}
 cx.imageSmoothingEnabled=true;cx.imageSmoothingQuality='high';cx.drawImage(img,0,0,w,h);return c}
function canvasBlob(canvas,mime,quality){return new Promise((resolve,reject)=>canvas.toBlob(blob=>{
 if(!blob){reject(Error('This browser cannot encode '+mime));return}
 if(blob.type!==mime){reject(Error('This browser cannot encode '+mime+'; received '+blob.type+' instead.'));return}
 resolve(blob);
},mime,quality))}
function bitmapBlob(canvas){const w=canvas.width,h=canvas.height,ctx=canvas.getContext('2d',{willReadFrequently:true}),rgba=ctx.getImageData(0,0,w,h).data;
 const stride=w*3+(4-(w*3)%4)%4, bytes=new Uint8Array(54+stride*h),view=new DataView(bytes.buffer);
 bytes[0]=66;bytes[1]=77;view.setUint32(2,bytes.length,true);view.setUint32(10,54,true);view.setUint32(14,40,true);view.setInt32(18,w,true);view.setInt32(22,h,true);view.setUint16(26,1,true);view.setUint16(28,24,true);view.setUint32(34,stride*h,true);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const src=(y*w+x)*4,dst=54+(h-y-1)*stride+x*3;bytes[dst]=rgba[src+2];bytes[dst+1]=rgba[src+1];bytes[dst+2]=rgba[src]}
 return new Blob([bytes],{type:'image/bmp'});
}
async function icoBlob(canvas){const c=document.createElement('canvas');c.width=c.height=256;const cx=c.getContext('2d');
 const s=Math.min(256/canvas.width,256/canvas.height),w=Math.round(canvas.width*s),h=Math.round(canvas.height*s);
 cx.drawImage(canvas,(256-w)/2,(256-h)/2,w,h);const png=new Uint8Array(await (await canvasBlob(c,'image/png')).arrayBuffer());
 const out=new Uint8Array(22+png.length),v=new DataView(out.buffer);
 v.setUint16(0,0,true);v.setUint16(2,1,true);v.setUint16(4,1,true);
 out[6]=0;out[7]=0;out[8]=0;out[9]=0;v.setUint16(10,1,true);v.setUint16(12,32,true);
 v.setUint32(14,png.length,true);v.setUint32(18,22,true);out.set(png,22);
 return new Blob([out],{type:'image/x-icon'});
}
function asciiBytes(text){return new TextEncoder().encode(text)}
function joinBytes(arr){const size=arr.reduce((n,a)=>n+a.length,0),out=new Uint8Array(size);let i=0;for(const a of arr){out.set(a,i);i+=a.length}return out}
async function pdfBlob(canvas){
 const jpeg=new Uint8Array(await(await canvasBlob(canvas,'image/jpeg',Number($('quality').value)/100)).arrayBuffer());
 const width=canvas.width,height=canvas.height,pageW=595.28,pageH=841.89,margin=28;
 const scale=Math.min((pageW-2*margin)/width,(pageH-2*margin)/height),w=width*scale,h=height*scale;
 const x=((pageW-w)/2).toFixed(2),y=((pageH-h)/2).toFixed(2);
 const content=asciiBytes('q\n'+w.toFixed(2)+' 0 0 '+h.toFixed(2)+' '+x+' '+y+' cm\n/Im1 Do\nQ\n');
 const segments=[],offsets=[0];let pos=0;
 function append(a){segments.push(a);pos+=a.length}
 function addObj(num,parts){offsets[num]=pos;append(asciiBytes(num+' 0 obj\n'));for(const part of parts)append(typeof part==='string'?asciiBytes(part):part);append(asciiBytes('\nendobj\n'))}
 append(asciiBytes('%PDF-1.4\n%\xD0\xD0\xD0\xD0\n'));
 addObj(1,['<< /Type /Catalog /Pages 2 0 R >>']);
 addObj(2,['<< /Type /Pages /Kids [3 0 R] /Count 1 >>']);
 addObj(3,['<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>']);
 addObj(4,['<< /Type /XObject /Subtype /Image /Width '+width+' /Height '+height+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+jpeg.length+' >>\nstream\n',jpeg,'\nendstream']);
 addObj(5,['<< /Length '+content.length+' >>\nstream\n',content,'endstream']);
 const xref=pos;append(asciiBytes('xref\n0 6\n0000000000 65535 f \n'));
 for(let i=1;i<=5;i++)append(asciiBytes(String(offsets[i]).padStart(10,'0')+' 00000 n \n'));
 append(asciiBytes('trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF'));
 return new Blob(segments,{type:'application/pdf'});
}
async function svgBlob(canvas){const png=await canvasBlob(canvas,'image/png'),bytes=new Uint8Array(await png.arrayBuffer());let b='';for(let i=0;i<bytes.length;i+=32768)b+=String.fromCharCode(...bytes.subarray(i,i+32768));
 const xml='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="'+canvas.width+'" height="'+canvas.height+'" viewBox="0 0 '+canvas.width+' '+canvas.height+'"><image width="100%" height="100%" href="data:image/png;base64,'+btoa(b)+'"/></svg>';
 return new Blob([xml],{type:'image/svg+xml'});
}
async function base64Blob(canvas){const png=await canvasBlob(canvas,'image/png');const bytes=new Uint8Array(await png.arrayBuffer());let str='';for(let i=0;i<bytes.length;i+=32768)str+=String.fromCharCode(...bytes.subarray(i,i+32768));
 return new Blob(['data:image/png;base64,'+btoa(str)],{type:'text/plain;charset=utf-8'})}
async function convertOne(entry){
 const img=await decodeImage(entry.file),canvas=canvasFor(img,CONFIG.target),t=CONFIG.target,q=Number($('quality').value)/100;
 let blob;
 if(['PNG','JPG','WEBP'].includes(t))blob=await canvasBlob(canvas,MIME[t],q);
 else if(t==='BMP')blob=bitmapBlob(canvas);
 else if(t==='ICO')blob=await icoBlob(canvas);
 else if(t==='SVG')blob=await svgBlob(canvas);
 else if(t==='PDF')blob=await pdfBlob(canvas);
 else if(t==='BASE64')blob=await base64Blob(canvas);
 else throw Error('Unsupported output target');
 const stem=entry.name.replace(/\.[^.]*$/,'')||'image';
 return {blob,name:stem+'-converted.'+EXT[t],width:canvas.width,height:canvas.height};
}
$('convert-btn').onclick=async()=>{
 if(state.busy||!files.length)return;
 state.busy=true;clearResults();renderQueue();$('convert-label').textContent='Converting…';
 let ok=0,errors=[];
 for(let i=0;i<files.length;i++){
  status('Converting '+(i+1)+' of '+files.length+'…');
  try{const c=await convertOne(files[i]);converted.push({...c,url:URL.createObjectURL(c.blob)});ok++}
  catch(err){errors.push(files[i].name+': '+(err?.message||'unknown error'));}
  await new Promise(r=>setTimeout(r,0));
 }
 state.busy=false;renderQueue();$('convert-label').textContent='Convert to '+CONFIG.target;
 if(ok){$('results-section').hidden=false;$('result-count').textContent=ok;renderResults();$('results-section').scrollIntoView({behavior:'smooth',block:'start'})}
 const report=ok+' converted'+(errors.length?' · '+errors.length+' failed: '+errors.slice(0,2).join(' | '):' · ready to download');status(report);
};
function download(url,name){const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove()}
function renderResults(){resultsEl.innerHTML='';for(const c of converted){
 const row=document.createElement('div');row.className='result-item';
 const icon=document.createElement('span');icon.className='square out-square';icon.textContent=CONFIG.target;
 const detail=document.createElement('div');detail.className='file-details';detail.innerHTML='<strong>'+escapeHTML(c.name)+'</strong><span>'+readable(c.blob.size)+' · '+c.width+' × '+c.height+'</span>';
 const button=document.createElement('button');button.className='download-btn';button.textContent='Save ↓';button.onclick=()=>download(c.url,c.name);
 row.append(icon,detail,button);resultsEl.append(row);
 }}
// Write a standards-compliant uncompressed ZIP archive entirely in-browser.
function crc32(bytes){let crc=0xffffffff;for(let i=0;i<bytes.length;i++){crc^=bytes[i];for(let j=0;j<8;j++)crc=(crc>>>1)^((crc&1)?0xedb88320:0)}return (crc^0xffffffff)>>>0}
const u16=(v)=>{const a=new Uint8Array(2);new DataView(a.buffer).setUint16(0,v,true);return a};
const u32=(v)=>{const a=new Uint8Array(4);new DataView(a.buffer).setUint32(0,v,true);return a};
async function zipBlob(entries){const parts=[],central=[];let offset=0;
 for(const item of entries){const name=asciiBytes(item.name),data=new Uint8Array(await item.blob.arrayBuffer());
 if(data.length>0xffffffff)throw Error('File too large for ZIP');
 const crc=crc32(data),length=data.length;
 const local=joinBytes([u32(0x04034b50),u16(20),u16(0x0800),u16(0),u16(0),u16(0),u32(crc),u32(length),u32(length),u16(name.length),u16(0),name]);
 parts.push(local,data);
 central.push(joinBytes([u32(0x02014b50),u16(20),u16(20),u16(0x0800),u16(0),u16(0),u16(0),u32(crc),u32(length),u32(length),u16(name.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),name]));
 offset+=local.length+data.length;
 }
 const centralBytes=joinBytes(central),centralLength=centralBytes.length;
 const end=joinBytes([u32(0x06054b50),u16(0),u16(0),u16(entries.length),u16(entries.length),u32(centralLength),u32(offset),u16(0)]);
 return new Blob([...parts,centralBytes,end],{type:'application/zip'});
}
$('download-all').onclick=async()=>{try{status('Preparing ZIP…');const b=await zipBlob(converted);const url=URL.createObjectURL(b);download(url,CONFIG.slug+'-converted.zip');setTimeout(()=>URL.revokeObjectURL(url),45000);status('ZIP downloaded')}catch(e){status('ZIP error: '+e.message)}};
