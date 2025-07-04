import { CookieOptions, Response } from "express";

export const REFRESH_PATH = '/';
const secure = process.env.NODE_ENV !== "development";

const defaults: CookieOptions = {
    httpOnly: true,
    secure: secure,
    sameSite: "strict",
}

export const getAccessTokenCookieOptions = (): CookieOptions => ({
    ...defaults,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
});

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
    ...defaults,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
    path: REFRESH_PATH,
});

type Params = {
    res: Response;
    accessToken: string;
    refreshToken: string;
}

export const setAuthCookies = ({ res, accessToken, refreshToken }: Params) => {
    return res
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());
}


export const clearAuthCookies = (res: Response) => {
    return res
    .clearCookie("accessToken")
    .clearCookie("refreshToken", { path: REFRESH_PATH })
    .clearCookie("refreshToken", { path: "api/auth/refresh" });
}