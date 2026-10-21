import { WebPartContext } from '@microsoft/sp-webpart-base';
import { spfi, SPFI, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/fields';

const cache = new WeakMap<WebPartContext, SPFI>();

export const getSp = (context: WebPartContext): SPFI => {
  let sp = cache.get(context);
  if (!sp) {
    sp = spfi().using(SPFx(context));
    cache.set(context, sp);
  }
  return sp;
};
