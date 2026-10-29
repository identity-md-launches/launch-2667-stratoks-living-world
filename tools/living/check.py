#!/usr/bin/env python3
"""Offline structural checks of the named outputs; no visual certification."""
import hashlib
import json
import struct
import zlib
import sys
sys.dont_write_bytecode = True
from pathlib import Path
from pack import ROOT, read_png


def check():
    manifest=json.loads((ROOT/'docs/living/manifest.json').read_text())
    results=[]
    for asset in manifest['assets']:
        path=ROOT/asset['path'];data=path.read_bytes()
        assert data[:8]==b'\x89PNG\r\n\x1a\n'
        assert hashlib.sha256(data).hexdigest()==asset['sha256'],path
        p=8;idat=[];header=None;kinds=[]
        while p<len(data):
            n=struct.unpack('>I',data[p:p+4])[0];k=data[p+4:p+8];payload=data[p+8:p+8+n]
            assert zlib.crc32(k+payload)&0xffffffff==struct.unpack('>I',data[p+8+n:p+12+n])[0]
            kinds.append(k)
            if k==b'IHDR':header=struct.unpack('>IIBBBBB',payload)
            if k==b'IDAT':idat.append(payload)
            p+=n+12
        assert p==len(data) and kinds[-1]==b'IEND'
        w,h,depth,color,comp,filt,interlace=header
        assert (w,h)==(asset['width'],asset['height'])
        assert (depth,comp,filt,interlace)==(8,0,0,0)
        assert color==(2 if path.stem=='model' else 6)
        raw=zlib.decompress(b''.join(idat));channels=3 if color==2 else 4
        assert len(raw)==h*(w*channels+1)
        assert all(raw[y*(w*channels+1)] in range(5) for y in range(h))
        entry={'path':asset['path'],'dimensions':[w,h],'format':'image/png',
          'color':'RGB' if color==2 else 'RGBA','bytes':len(data),
          'sha256':asset['sha256'],'pngSignatureCRCAndDecompression':'pass'}
        if color==6:
            _,_,rows=read_png(path);slots=asset['sprites'];covered=0;min_padding=320
            assert len(slots)==(36 if path.stem=='characters' else 32)
            for slot in slots:
                x,y,cw,ch=slot['rect'];assert cw==ch==320 and slot['anchor']==[160,280]
                points=[(xx,yy) for yy in range(y,y+ch) for xx in range(x,x+cw) if rows[yy][xx*4+3]]
                assert points,slot['id']
                x0=min(xx for xx,yy in points);x1=max(xx for xx,yy in points)+1
                y0=min(yy for xx,yy in points);y1=max(yy for xx,yy in points)+1
                assert [x0,y0,x1,y1]==slot['visibleBounds']
                padding=min(x0-x,y0-y,x+cw-x1,y+ch-y1)
                assert padding>=12,(slot['id'],padding)
                min_padding=min(min_padding,padding);covered+=len(points)
            zero=sum(row[3::4].count(0) for row in rows)
            assert zero+covered==w*h
            assert zero/(w*h)>.5
            assert all(a==0 or a>16 for row in rows for a in row[3::4])
            entry.update({'spriteCount':len(slots),'allCellsNonempty':True,'allAnchorsConsistent':True,
              'minimumTransparentGutterPixels':min_padding,'transparentFraction':round(zero/(w*h),6),
              'sourceRegistrationAndAlphaBounds':'pass'})
        results.append(entry)
    report={'status':'pass','scope':'PNG bytes, hashes, decompression, alpha, cells, bounds and anchor geometry only',
      'notCertified':['species aesthetics','temporal animation quality','seamless shore tiling','engine integration','independent visual approval'],
      'assets':results}
    (ROOT/'docs/living/validation.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report,indent=2))

if __name__=='__main__':check()
