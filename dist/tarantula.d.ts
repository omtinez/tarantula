/// <reference types="request-promise-native" />
import * as url from 'url';
import { Requests } from 'ootils';
import { Mutex } from 'await-semaphore';
import { Cooky } from './cooky';
import * as puppeteer from 'puppeteer';
export { Cooky };
export declare type Request = puppeteer.Request;
export declare type Response = puppeteer.Response;
export declare type StringMap = {
    [key: string]: string;
};
export interface SpiderOptions {
    browser?: puppeteer.Browser;
    emulate?: string;
    verbose?: boolean;
}
export interface LoadOptions extends puppeteer.NavigationOptions {
    /** "Wipe" the tab by loading about:blank before loading intended URL */
    blank?: boolean;
}
export interface PostOptions extends Requests.RequestPromiseOptions {
    /** Parse set-cookies from response header and copy them to this spider instance by default */
    rejectCookies?: boolean;
}
export interface DistillerOptions {
    /** Engine used to retrieve a reading-friendly version */
    engine: 'chromium' | 'firefox' | 'safari';
    /** Print errors to the console */
    printErrors?: boolean;
}
export declare const _DistillerOptionsDefault: DistillerOptions;
export declare class Spider {
    verbose: boolean;
    ownBrowser: boolean;
    page: puppeteer.Page;
    browser: puppeteer.Browser;
    clones: Spider[];
    constructor(browser: puppeteer.Browser, page: puppeteer.Page, ownBrowser?: boolean, verbose?: boolean);
    static create(opts?: SpiderOptions): Promise<Spider>;
    /**
     * See https://github.com/GoogleChrome/puppeteer/blob/master/DeviceDescriptors.js
     * @param deviceName name of the device to emulate, for example "iPhone X"
     */
    emulate(deviceName: string): Promise<void>;
    exec(code: puppeteer.EvaluateFn, ...args: any[]): Promise<any>;
    url(): Promise<string>;
    load(uri: url.Url | string, opts?: LoadOptions): Promise<puppeteer.Response>;
    /**
     * Shorthand for the `page.screenshot()` function.
     * @param opts screenshot options object
     */
    screenshot(opts?: puppeteer.ScreenshotOptions): Promise<string | Buffer>;
    awaitResponse(filter: (response: Response) => any, timeout?: number): Promise<any>;
    /**
     * Creates a new tab using parent browser and copies settings from this instance into new page.
     */
    clone(): Promise<Spider>;
    kill(): Promise<void>;
    setCookie(...cookies: (puppeteer.SetCookie | string)[]): Promise<void[]>;
    mouseMove(x?: number, y?: number, steps?: number): Promise<void>;
    /**
     * Sends a POST request from Node, using the browser's cookies
     * TODO: send the POST request by injecting Javascript instead of from Node
     * @param url destination of the POST request
     * @param opts optional settings for the POST request
     */
    post(url: string, opts?: PostOptions): Promise<any>;
    /**
     * Distills the page into a readable format
     */
    distill(opts?: DistillerOptions): Promise<string>;
    /**
     * Saves the current page into a web archive in MHTML format
     * @param path local destination of the web archive MHTML file
     */
    archive(path: string): Promise<void>;
}
export declare class SpiderPool {
    spiders: Spider[];
    browser: puppeteer.Browser;
    mutex: Mutex;
    spidersFree: Spider[];
    spidersBusy: Spider[];
    awaiters: ((spider: Spider) => Promise<void>)[];
    protected constructor(browser: puppeteer.Browser, spiders: Spider[]);
    static create(num?: number, opts?: SpiderOptions): Promise<SpiderPool>;
    /**
     * Acquire an available Spider from the pool. If `timeoutMillis` is zero, wait indefinitely. If
     * it's a negative number, throw a timeout error immediately if no Spider is available.
     * Otherwise, wait the given number of milliseconds until a Spider becomes available. By default
     * this function waits indefinitely.
     * @param timeoutMillis milliseconds to wait until timeout error is thrown
     */
    acquire(timeoutMillis?: number): Promise<Spider>;
    release(spider: Spider): Promise<void>;
    with<T>(callback: (spider: Spider) => Promise<T>, acquireTimeout?: number): Promise<T>;
    dispose(): Promise<void>;
}
