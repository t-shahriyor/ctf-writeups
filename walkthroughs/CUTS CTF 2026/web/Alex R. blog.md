# alex r. blog

## overview

this was a **web + exposed git** challenge.

the login page and `/vault` were bait. the real clue trail was in the blog text:

- check `robots.txt`
    
- check **git history**
    
- break **ciphertext** if needed
    

the actual flag was recoverable straight from the exposed git repo.

---

## 1) initial recon

homepage showed:

- blog posts about:
    
    - **radiohead / ok computer**
        
    - **vigenere cipher**
        
    - **ghost in the machine**
        
    - **my setup**
        
- hidden paths in `robots.txt`:
    
    - `/admin-1337`
        
    - `/vault`
        

that makes it look like an auth challenge at first.

---

## 2) false trail: login and vault

i tested:

- `/admin-1337`
    
- `/vault`
    

observations:

- `/admin-1337` showed a login form
    
- `/vault` returned **403**
    
- trying likely passwords like `okcomputer` did **not** create a real session
    
- no auth cookies appeared
    
- `/vault` still stayed blocked
    

so this was not a normal password-guessing solve.

---

## 3) clue hidden in the post text

the important hint came from the **ghost in the machine** content:

> if you're the type who reads `robots.txt`, checks **git history**, stares at ciphertext until it breaks —

that line basically tells you the intended path:

- `robots.txt`
    
- `.git`
    
- maybe crypto
    

so the next move is to test whether the `.git` directory is exposed.

---

## 4) test exposed git

check:

```bash
curl -s http://challs.cuts.uz:5021/.git/HEAD
```

response:

```bash
ref: refs/heads/master
```

boom — the git repository is exposed.

that means the source code and history can likely be reconstructed directly from the web server.

---

## 5) dump git objects

the solve script then:

- fetched `/.git/HEAD`
    
- fetched common refs:
    
    - `/.git/refs/heads/master`
        
    - `/.git/logs/HEAD`
        
    - `/.git/packed-refs`
        
- extracted commit hashes
    
- downloaded matching object files from:
    
    - `/.git/objects/xx/yyyy...`
        
- decompressed them with zlib
    
- parsed:
    
    - commits
        
    - trees
        
    - blobs
        

once blobs were reconstructed, it searched their contents for:

```python
CUTS{...}
```

---

## 6) flag found in source

the script recovered source files from the repo and found the flag directly in:

```text
app.py
```

flag:

```text
CUTS{gh0st_1n_th3_m4ch1n3_4l3x_n3v3r_d13d}
```

---

## 7) why the challenge was tricky

it tried to distract you with:

- login form
    
- `/vault`
    
- “favorite password” hint
    
- radiohead references
    
- vigenere post
    

those clues were not useless, but they were **not the primary exploit path**.

the real intended hint was:

- “checks git history”
    
- “machine remembers”
    

meaning:

> deleted or hidden secrets still remain in git history.

---

## key lesson

when a web challenge talks about:

- memory
    
- old versions
    
- history
    
- preserved site
    
- “the machine remembers”
    

always test:

```bash
/.git/HEAD
```

because exposed git often gives you:

- source code
    
- deleted secrets
    
- old commits
    
- flags left in history
    

---

## short solve summary

```text
recon → robots.txt/admin/vault bait → read blog hints → test /.git/HEAD → dump git objects → recover app.py → grep flag
```

## final flag

```text
CUTS{gh0st_1n_th3_m4ch1n3_4l3x_n3v3r_d13d}
```