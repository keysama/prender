import { prenderTag } from "../../constants";

export function isInPuppeteer(){
    return !!window[prenderTag];
  }

export function transUrlToId(url){
    return url
    .replace(/http(?:s):\/\//g, '')
    .replace(/\//g, '[tag1]')
    .replace(/\?/g, '[tag2]')
    .replace(/\&/g, '[tag3]')
    .replace("%20"," ");
}