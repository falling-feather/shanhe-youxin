const requests=new WeakMap();
/** 避免新对白配上旧画像。只公开当前请求的已解码图像，失败由调用方显示具体状态。 */
export function syncIllustration(image,source,onError=()=>{}){
 const request={};requests.set(image,request);image.hidden=true;image.src=source;
 return image.decode().then(()=>{if(requests.get(image)!==request)return false;image.hidden=false;return true;},error=>{if(requests.get(image)===request)onError(error);return false;});
}
