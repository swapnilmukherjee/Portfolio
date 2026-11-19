"""Trace the existing studio photo with deterministic color segmentation.

No model, generative image, face retouching, or changed photo pixels.
The output is an SVG alpha mask; the browser displays original headshot.jpg.
Requires Pillow, numpy and OpenCV only when rebuilding this checked-in mask.
"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
import cv2

root = Path(__file__).resolve().parents[1]
photo = Image.open(root / 'public/headshot.jpg').convert('RGB')
small = photo.resize((561, 701), Image.Resampling.LANCZOS)
rgb = np.asarray(small)
# A loose, source-photo-specific contour supplies spatial context to GrabCut.
# All classification is deterministic color/edge optimization, without pretrained neural models or generated RGB pixels.
outline = np.array([(0,701),(560,701),(556,493),(535,441),(482,408),(416,383),(395,364),(391,324),(400,266),(405,215),(411,157),(402,103),(371,62),(328,45),(270,45),(218,63),(182,97),(166,145),(179,208),(190,255),(194,294),(205,332),(210,354),(201,372),(160,391),(110,413),(61,443),(33,494),(8,603)], dtype=np.int32)
shape = np.zeros((701,561),np.uint8)
cv2.fillPoly(shape,[outline],255)
mask = np.full(shape.shape,cv2.GC_PR_BGD,dtype=np.uint8)
mask[shape>0] = cv2.GC_PR_FGD
safe_subject = cv2.erode(shape,np.ones((49,49),np.uint8))
mask[safe_subject>0] = cv2.GC_FGD
outside = cv2.dilate(shape,np.ones((35,35),np.uint8)) == 0
mask[outside] = cv2.GC_BGD
bg_model=np.zeros((1,65),np.float64);fg_model=bg_model.copy()
cv2.setRNGSeed(17)
cv2.grabCut(cv2.cvtColor(rgb,cv2.COLOR_RGB2BGR),mask,None,bg_model,fg_model,6,cv2.GC_INIT_WITH_MASK)
subject = (mask==cv2.GC_FGD)|(mask==cv2.GC_PR_FGD)
# Preserve the original pixels; soften only the SVG silhouette edge.
alpha = Image.fromarray((subject*255).astype('uint8')).filter(ImageFilter.GaussianBlur(.45))
# Keep the SVG code compact by tracing each foreground scanline as a run.
mask = np.asarray(alpha) > 127
paths = []
for y, row in enumerate(mask):
    edges = np.diff(np.r_[False, row, False].astype(int))
    for left, right in zip(np.flatnonzero(edges == 1), np.flatnonzero(edges == -1)):
        paths.append(f'M{left} {y}h{right-left}v1h{left-right}z')
svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1122" height="1402" viewBox="0 0 561 701"><defs><filter id="edge" x="-2%" y="-2%" width="104%" height="104%"><feGaussianBlur stdDeviation=".5"/></filter></defs><path fill="white" filter="url(#edge)" d="' + ''.join(paths) + '"/></svg>\n'
(root / 'public/portrait-mask.svg').write_text(svg)
# Internal QA rendering only. Original RGB values are retained exactly.
preview = photo.convert('RGBA')
preview.putalpha(alpha.resize(photo.size, Image.Resampling.LANCZOS))
preview.save('/tmp/original-portrait-mask-review.png')
print('Wrote deterministic SVG mask; photo remains unchanged.')
