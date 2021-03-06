import { NextApiRequest, NextApiResponse } from 'next';
import { authorize, ensureAuthorization } from './authorize';
import { storeAccessToken } from './cookie';

/**
 * A Node handler for processing incomming requests to exchange an Authorization Code
 * for an Access Token using the WordPress API. Once the code is exchanged, this
 * handler stores the Access Token on the cookie and redirects to the frontend.
 */
export async function nextAuthorizeHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { code, redirect_uri: redirectUri } = req.query;

    const host = req.headers.host ?? '';
    const protocol = /localhost/.test(host) ? 'http:' : 'https:';
    const fullRedirectUrl = `${protocol}//${host}/${redirectUri as string}`;

    /**
     * If missing code, this is a request that's meant to trigger authorization such as a preview.
     */
    if (!code && redirectUri) {
      const response = ensureAuthorization(fullRedirectUrl);

      if (typeof response !== 'string' && response?.redirect) {
        res.redirect(response.redirect);

        return;
      }

      /**
       * We already have an auth code stored, go ahead and redirect.
       */
      res.redirect(302, fullRedirectUrl);
      return;
    }

    if (!code || !redirectUri) {
      res.statusCode = 401;
      res.end();

      return;
    }

    const result = await authorize(code as string);
    storeAccessToken(result.access_token, res);

    /**
     * Set cookie to enable previewing.
     */
    console.debug('Setting Next.js Preview Data');
    res.setPreviewData({});

    res.redirect(302, redirectUri as string);
  } catch (e) {
    console.debug('Clearing Next.js Preview Data');
    res.clearPreviewData();

    res.statusCode = 500;
    res.end();
  }
}
