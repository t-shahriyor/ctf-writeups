
## Challenge Summary

- Contained file: [trench.png](https://cuts.uz/files/7a461616c31cf2ec2f2b42b2163f8570/handout.zip?token=eyJ1c2VyX2lkIjo2LCJ0ZWFtX2lkIjo0LCJmaWxlX2lkIjoxMX0.aesaTw.WVRr_OPy9YdtKPQiwfSnlhKcvfE)
- Flag: `CUTS{4bys5_1n_7h3_chunk5_4nd}`

This challenge chained together three ideas:

1. PNG metadata inspection
2. Hidden encrypted payload extraction
3. SSTV audio decoding

## 1. Inspect the archive

The zip only contained one file:

```bash
unzip -l trenchtalk.zip
```

Output showed a single image:

- `trench.png`

## 2. Inspect PNG metadata


```bash
exiftool trench.png
```

Important finding:

- Base64 encoded python script to retrieve key
- `exiftool` also warned about text chunks after `IDAT`

After decoding the base64, the embedded Python was:

```python
import hashlib
from PIL import Image

def get_key():
    img = Image.open("trench.png")
    w, h = img.size
    pixels = img.load()
    seed = []
    for y in range(0, h, 10):
        for x in range(0, w, 10):
            r, g, b, a = pixels[x, y]
            if b > 200 and g < 50 and r < 50:
                seed.append(chr((r + g + b) % 256))
    key_material = "".join(seed[:32])
    return hashlib.sha256(key_material.encode()).digest()
```

This told us the challenge author had embedded the decryption key material directly in the image pixels.

## 3. Enumerate PNG chunks

The next step was to inspect the PNG chunk layout. A small parser showed:

- normal `IHDR`
- many `IDAT` chunks
- one `tEXt` chunk containing the base64 script
- one large custom chunk named `crPT`

That `crPT` chunk was the real payload.

## 4. Derive the AES key

Using the provided logic on `trench.png` produced this SHA-256 key:

```text
432d285385f371108ce94e807d3af5568fef1460b4fbe0c4cc8615a342f4d35e
```

At that point the obvious hypothesis was:

- `crPT` = encrypted blob
- script-derived SHA-256 = symmetric key

## 5. Decrypt the custom chunk

Testing common symmetric modes showed the correct one quickly:

- key: the SHA-256 digest from the embedded script
- IV: first 16 bytes of the `crPT` chunk
- ciphertext: remaining bytes of the `crPT` chunk
- mode: `AES-CBC`

Decryption produced a valid WAV header:

```text
RIFF....WAVEfmt
```

So the hidden payload inside the PNG was actually an audio file.

## 6. Analyze the decrypted WAV

The decrypted file was:

- PCM WAV
- mono
- 44100 Hz
- about 1 minute 50 seconds

A spectrogram of the audio showed structured tone signaling, not speech. The frequency pattern matched SSTV-style image transmission, and the timing matched a Scottie mode transmission.

At that point the easiest path was to decode the WAV as SSTV. Once decoded, the transmitted trench image contained the flag.

## 7. Recover the flag

Decoded SSTV image result:

```text
CUTS{4bys5_1n_7h3_chunk5_4nd}
```

## Solve Path Summary

In short, the chain was:

1. unzip archive
2. inspect `trench.png`
3. decode the base64 Python from metadata
4. derive the AES key from sampled blue-ish pixels
5. extract the custom `crPT` chunk
6. decrypt it with `AES-CBC`
7. recognize the decrypted data as WAV
8. decode the WAV as SSTV
9. read the flag from the recovered image

## Key Commands

Useful commands from the solve:

```bash
unzip -l trenchtalk.zip
exiftool trench.png
strings -n 8 trench.png | head
```

Minimal Python tasks that mattered:

- parse PNG chunks
- decode the base64 script
- reproduce key derivation
- decrypt `crPT` with AES-CBC
- save the plaintext as `trench.wav`

Then decode the WAV with an SSTV decoder.

## Lessons Learned

1. Always inspect image metadata before jumping into heavier stego tooling.
2. Custom PNG chunks are a common place to hide encrypted payloads.
3. If the author gives you code, trust it as the intended key schedule unless evidence says otherwise.
4. A decrypted payload is not always the flag itself; it can just be the next stage.
5. Spectrograms are extremely useful for distinguishing speech, modem tones, Morse, SSTV, and other audio encodings.
6. CTF stego challenges often combine multiple light layers instead of one deep trick.

## Final Answer

```text
CUTS{4bys5_1n_7h3_chunk5_4nd}
```
