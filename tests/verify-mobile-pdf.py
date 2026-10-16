from pathlib import Path
import fitz,json,zipfile,re,unicodedata,sys
out=Path(sys.argv[1]) if len(sys.argv)>1 else Path('mobile-pdf-evidence')
with zipfile.ZipFile(out/'client-records.zip') as z:
 (out/'executive-package.pdf').write_bytes(z.read(next(n for n in z.namelist() if n.endswith('.pdf'))))
report={}
texts={}
for name in ['projection','strategy','executive-package']:
 doc=fitz.open(out/(name+'.pdf'));sizes=[];body=[];words=0
 for page in doc:
  assert abs(page.rect.width-360)<.01 and abs(page.rect.height-640)<.01
  for block in page.get_text('dict')['blocks']:
   for line in block.get('lines',[]):
    for span in line['spans']:
     x0,y0,x1,y1=span['bbox']
     assert x0>=22 and x1<=338,(name,span)
     assert y0>=0 and y1<=640,(name,span)
     if y0>42 and y1<612:
      assert span['size']>=10.9,(name,span)
      if re.fullmatch(r'\$[\d,.]+',span['text']):assert span['size']>=18,(name,span)
      sizes.append(span['size']);body.append(span['text']);words+=len(span['text'].split())
 texts[name]=' '.join(body)
 report[name]={'pages':len(doc),'width_pt':360,'height_pt':640,'minimum_content_font_pt':min(sizes),'selectable_words':words,'text_within_page':True}
normalize=lambda s:re.sub(r'[^a-z0-9]','',unicodedata.normalize('NFKD',s.lower()).encode('ascii','ignore').decode())
expected=json.loads((out/'expected-financial-values.json').read_text());actual=normalize(texts['projection'])
missing=[item for item in expected if normalize(item['value']) not in actual]
assert not missing,missing
assert normalize(texts['projection'])==normalize(texts['executive-package'])
assert report['projection']['pages']==6,report
assert report['strategy']['pages']==2,report
assert report['executive-package']['pages']==6,report
report['content']={'original_financial_values_preserved':len(expected),'missing':missing,'zip_report_matches_direct_pdf':True}
(out/'verification.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
