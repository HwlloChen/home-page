/**
 * 设置 cookie，默认 15 天有效期
 * @param key
 * @param value
 * @param expire
 */
export function setCookie(key, value, expire = 15 * 24 * 3600) {
    const date = new Date();
    date.setTime(date.getTime() + expire * 1000);
    document.cookie = `${key}=${value}; expires=${date.toUTCString()}; path=/; SameSite=Lax; Secure`;
}

/**
 * 删除 cookie
 * @param key
 */
export function removeCookie(key) {
    setCookie(key, '', -1);
}

/**
 * 获取 cookie
 * @param key
 */
export function getCookie(key) {
    var name = key + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}