
# stega hidden — writeup

## challenge overview

we are given an image called:


stega_hidden.jpg

![[stega_hidden.jpg]]


at first glance, it looks like a normal jpeg.  
but the man in the image seems to be pointing **downward**, like he is trying to show something that is **below the visible part of the picture**.

that is a strong hint that the actual image may be taller, and the visible file is only showing the upper part because of the height value stored in the jpeg header.

---

## first idea

instead of trying lsb, strings, or metadata first, the better idea here is to check whether the jpeg dimensions were manually limited.

in jpeg files, the image **width** and **height** are stored inside the **sof0** section.

**sof0** means:

```text
start of frame 0
```

this section begins with the marker:

```text
ff c0
```

so if we open the file in a hex editor and find `ff c0`, we can locate the bytes that define the image dimensions.

---

## jpeg structure used here

after the `ff c0` marker, the fields are arranged like this:

- `+0 +1` → `ff c0`
    
- `+2 +3` → segment length
    
- `+4` → precision
    
- `+5 +6` → **height**
    
- `+7 +8` → **width**
    

so the most important thing for this challenge is:

```text
+5 +6 = height
```

![[Pasted image 20260420111605.png]]

![[Pasted image 20260420112332.png]]

---

## finding the current height

after locating the `ff c0` marker in the hex editor, we inspect the bytes at offset `+5 +6`.

the original height value is:

```text
02 00
```

that means the jpeg is currently being displayed with a much smaller height than what we actually want.

so the idea is simple:

- keep the width unchanged
    
- increase the height value
    
- reopen the image and see if more content becomes visible
    

---

## modifying the jpeg

we change the height bytes from:

```text
02 00
```

to:

```text
3E 80
```

this makes the image height much larger.

![[Pasted image 20260420113107.png]]

after saving the modified file, we open it again.

---

## result

after increasing the height, the image reveals the hidden lower area.

this **second jpeg** is the **result image after the height was increased**, and it contains the flag:

![[stega_hiddesn.jpg]]

so this second image is not the original one — it is the recovered result after editing the jpeg header.

---

## flag

```text
ONECTF{w0w_y0u_s4w_1t}
```

---

## final explanation

the trick in this challenge was not classical steganography like hidden bits or metadata.

the real trick was that the jpeg was artificially limited by its stored height value.  
by editing the **sof0 height field** in hex, we forced the image viewer to render more of the actual image data, which revealed the hidden bottom part and the flag.

---

