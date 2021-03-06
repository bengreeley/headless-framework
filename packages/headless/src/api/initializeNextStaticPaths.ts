/**
 * Must be called from getStaticPaths within a Next app in order to support SSG.
 *
 * This function currently returns only the root path to be built during build-time. Any other pages will be built using
 * incremental static regeneration (ISR) thanks to the fallback props.
 */
import { GetStaticPathsResult } from 'next';

export function initializeNextStaticPaths(override?: GetStaticPathsResult) {
  return {
    /**
     * Only render the root path by default as we're also leveraging the fallback below which will render missing pages
     * during runtime and cache them.
     */
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    paths: ['/'],
    /**
     * Default to 'blocking' as the fallback method to remove the need to create a loading page for a limited subset
     * of visitors (those getting an uncached page).
     */
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    fallback: 'blocking',
    ...override,
  };
}
