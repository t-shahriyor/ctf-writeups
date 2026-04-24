

> "The vault has all you need. There is a key, however, is not one number but two halves: the first I sang, the second I drew. Put them in the order they were made and the vault will open."

## 🧩 Given Artifacts 
- **Vault**  `8608ac47d1cdd7b345ca93d1d9746ed534d2243d217b9d2839cac1f41f085010f268a723d88f88e867`
- estate.wav
- map.png


---

## 🎨 Finding “Drew”

This one was easy — the value was directly visible in the image.

![[map.png]]

Extracted value: `05BC43087E4FF34C66AEB3C0683D0F21`

No tricks here.

---

## 🎵 Finding “Sang”

The WAV file looked confusing at first, but it actually gives a hint.

![[Pasted image 20260424173045.png]]

- The beginning contains **16 notes in increasing order**
- That looks like a **reference table**
- 16 values → matches perfectly with **hex (0–f)**

After that:
- The audio continues with patterns using the same notes
- So each note corresponds to a hex digit

I mapped the notes manually and decoded the sequence.

Final result: `C55DF814AAFABF801ABCA7A4B51131E1`

---

## 🔗 Combining the Key

From the description:

> “First I sang, second I drew”

So the order is important:

FULL = Sang + Drew

FULL = `C55DF814AAFABF801ABCA7A4B51131E105BC43087E4FF34C66AEB3C0683D0F21`


---

## 🔓 Opening the Vault

Now XOR the combined key with the vault value:

Vault ⊕ Full = flag

`8608ac47d1cdd7b345ca93d1d9746ed534d2243d217b9d2839cac1f41f085010f268a723d88f88e867` ⊕ `C55DF814AAFABF801ABCA7A4B51131E105BC43087E4FF34C66AEB3C0683D0F21` = `CUTS{7h3_v4ule_41ng5_4nd_dr4w5_175_7ru7h}`

## 🚩 Final Flag

```flag
CUTS{7h3_v4ule_41ng5_4nd_dr4w5_175_7ru7h}
```


---

## ⚡ Key Idea

- Audio → hex via note mapping  
- Image → direct hex extraction  
- Final step → concatenate and XOR  

