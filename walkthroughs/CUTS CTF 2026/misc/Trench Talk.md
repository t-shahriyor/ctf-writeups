---
title: Trench Talk
category: misc
ctf: CUTS CTF 2026
points: 1000
author: Un1C0rN
flag: CUTS{example}
---

# Trench Talk

Challenge Summary
- Contained file: trench.png
- Flag: \`CUTS{4bys5_1n_7h3_chunk5_4nd}\`

This challenge chained together three ideas:
1. PNG metadata inspection
2. Hidden encrypted payload extraction

Here is an image using obsidian syntax:
![[trench.png]]

Here is one that has the attachments folder path:
![[attachments/screenshot1.png]]

And here is a normal markdown image just in case:
![alt text](../attachments/screenshot1.png)

## Method

First we analyzed the image:
\`\`\`bash
exiftool trench.png
\`\`\`

Then we extracted the payload.

### The script

Here is how we did it:
\`\`\`python
import sys
import zlib

def extract(file):
    print("Extracting...")
    # do something

extract("trench.png")
\`\`\`
