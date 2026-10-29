#!/usr/bin/env python3
"""Register generated RGBA sprites into deterministic cells; stdlib only.

No invented frames or runtime actions. Source pixels are not painted or interpolated.
Alpha <=16 matte residue and detached character dust <24 pixels are discarded;
remaining pixels are copied unchanged.
"""
import hashlib
import json
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

def paeth(a,b,c):
    p=a+b-c; x,y,z=abs(p-a),abs(p-b),abs(p-c)
    return a if x<=y and x<=z else b if y<=z else c

def read_png(path):
    data=path.read_bytes(); assert data[:8]==b'\x89PNG\r\n\x1a\n'
    p=8; chunks={}
    while p<len(data):
        n=struct.unpack('>I',data[p:p+4])[0]; k=data[p+4:p+8]; v=data[p+8:p+8+n]
        assert zlib.crc32(k+v)&0xffffffff==struct.unpack('>I',data[p+8+n:p+12+n])[0]
        chunks.setdefault(k,[]).append(v); p+=n+12
    w,h,d,c,co,fi,it=struct.unpack('>IIBBBBB',chunks[b'IHDR'][0])
    assert (d,c,co,fi,it)==(8,6,0,0,0), '8-bit noninterlaced RGBA required'
    raw=zlib.decompress(b''.join(chunks[b'IDAT'])); stride=w*4; out=[]; prev=bytearray(stride); p=0
    for _ in range(h):
        f=raw[p]; row=bytearray(raw[p+1:p+1+stride]);p+=stride+1
        for i in range(stride):
            a=row[i-4] if i>=4 else 0;b=prev[i];c=prev[i-4] if i>=4 else 0
            pred=0 if f==0 else a if f==1 else b if f==2 else (a+b)//2 if f==3 else paeth(a,b,c)
            row[i]=(row[i]+pred)&255
        out.append(row);prev=row
    return w,h,out

def write_png(path,w,h,rows):
    def chunk(k,v):return struct.pack('>I',len(v))+k+v+struct.pack('>I',zlib.crc32(k+v)&0xffffffff)
    data=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',w,h,8,6,0,0,0))
    data+=chunk(b'IDAT',zlib.compress(b''.join(b'\0'+bytes(r) for r in rows),9))+chunk(b'IEND',b'')
    path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(data)

CHAR_NAMES=[
 ['idle.front','idle.southeast','idle.east','idle.northeast','idle.back','idle.southwest'],
 ['walk.southeast.'+str(i) for i in range(6)],
 ['fish.ready','fish.cast.0','fish.cast.1','fish.wait','fish.reel','fish.catch'],
 ['gather.reach','gather.crouch','gather.lift','carry.berries','carry.wood.0','carry.wood.1'],
 ['build.ready','build.raise.0','build.strike.0','build.raise.1','build.strike.1','build.lower'],
 ['rest.settle','rest.drowsy','rest.sleep.0','rest.sleep.1','rest.wake','rest.stretch']]
WORLD_NAMES=[
 ['tree.oak','berries.full','berries.depleted','stock.wood','shore.river','shelter.foundation','shelter.frame','shelter.complete'],
 ['tree.palm','cactus','stone.sandstone','stock.stone-reeds','shore.oasis','shelter.foundation','shelter.frame','shelter.complete'],
 ['tree.spruce','berries.frost','stone.granite','stock.firewood','shore.ice','shelter.foundation','shelter.frame','shelter.complete'],
 ['tree.pine','reeds','stone.coastal','fishing.supplies','shore.sea','shelter.foundation','shelter.frame','shelter.complete']]

def pack(kind):
    src=ROOT/'docs/living/source'/f'{kind}-generated.png';w,h,rows=read_png(src)
    char=kind=='characters';cols,nrows=(6,6) if char else (8,4)
    assert (w,h)==((1254,1254) if char else (1774,887)), (w,h)
    xs=[0,218,430,655,857,1066,1254] if char else [0,257,447,653,854,1110,1318,1538,1774]
    ys=[0,217,419,628,829,1024,1254] if char else [0,268,474,680,887]
    names=CHAR_NAMES if char else WORLD_NAMES
    size=320; ow,oh=cols*size,nrows*size; dest=[bytearray(ow*4) for _ in range(oh)];slots=[]
    for r in range(nrows):
        for c in range(cols):
            rowxs=[0,234,435,666,863,1067,1254] if char and r==2 else xs
            x0,x1,y0,y1=rowxs[c],rowxs[c+1],ys[r],ys[r+1]
            points=[(x,y) for y in range(y0,y1) for x in range(x0,x1) if rows[y][x*4+3]>16]
            if char:
                # Remove detached extraction dust, retaining all components >=24px,
                # including fishing lines, tools, berries and the catch.
                remaining=set(points); kept=[]
                while remaining:
                    first=min(remaining);remaining.remove(first);stack=[first];component=[]
                    while stack:
                        px,py=stack.pop();component.append((px,py))
                        for nx,ny in ((px-1,py),(px+1,py),(px,py-1),(px,py+1),(px-1,py-1),(px+1,py+1),(px-1,py+1),(px+1,py-1)):
                            if (nx,ny) in remaining:
                                remaining.remove((nx,ny));stack.append((nx,ny))
                    if len(component)>=24:kept.extend(component)
                points=kept
            assert points
            bx0=min(x for x,y in points);bx1=max(x for x,y in points)+1
            by0=min(y for x,y in points);by1=max(y for x,y in points)+1
            # Author-measured foot contacts preserve body pivot even with extended rods.
            if char:
                ax=[109,320,529,739,950,1157][c];ay=[207,407,610,816,1015,1217][r]
            else:ax=(bx0+bx1)//2;ay=by1
            dx=c*size+160-ax;dy=r*size+280-ay
            for x,y in points:
                xx,yy=x+dx,y+dy
                assert c*size+12<=xx<(c+1)*size-12 and r*size+12<=yy<(r+1)*size-12, (kind,r,c,xx,yy)
                dest[yy][xx*4:xx*4+4]=rows[y][x*4:x*4+4]
            name=names[r][c] if char else ['forest','desert','cold','coast'][r]+'.'+names[r][c]
            slots.append({'id':name,'rect':[c*size,r*size,size,size], 'anchor':[160,280],
              'sourceRect':[x0,y0,x1-x0,y1-y0],'sourceAnchor':[ax,ay],
              'visibleBounds':[bx0+dx,by0+dy,bx1+dx,by1+dy],
              'edgeReviewRequired':True})
    out=ROOT/'artifacts/living'/f'{kind}.png';write_png(out,ow,oh,dest)
    return {'path':str(out.relative_to(ROOT)),'format':'image/png','width':ow,'height':oh,
      'color':'RGBA','bitDepth':8,'grid':[cols,nrows],'cell':[size,size],
      'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'bytes':out.stat().st_size,
      'transparentFraction':round(sum(row[3::4].count(0) for row in dest)/(ow*oh),6),
      'sourceSha256':hashlib.sha256(src.read_bytes()).hexdigest(),'sprites':slots}

if __name__=='__main__':
    assets=[pack(n) for n in ['characters','world']]
    model=ROOT/'artifacts/living/model.png';data=model.read_bytes();w,h=struct.unpack('>II',data[16:24])
    assets.insert(0,{'path':'artifacts/living/model.png','format':'image/png','width':w,'height':h,
      'role':'opaque model sheet; not an atlas','sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data)})
    report={'version':1,'pixelOrigin':'top-left','rectConvention':'x,y,width,height; half-open',
      'pivotConvention':'cell-local pixels; ground contact; draw top-left = worldScreen - anchor',
      'processing':'Lossless integer registration. Alpha <=16 discarded as matte residue; detached character extraction dust below 24 pixels removed. No painted pixels, resizing, mirrored frames or interpolated poses.',
      'runtimeIntegrated':False,'visualApproval':'Contributor inspection only; independent owner review pending', 'assets':assets}
    (ROOT/'docs/living/manifest.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps([{k:v for k,v in a.items() if k!='sprites'} for a in assets],indent=2))
