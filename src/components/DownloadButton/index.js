import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

/**
 * Download link for a static asset that respects the site `baseUrl`.
 *
 * The path is resolved through `useBaseUrl`, so the single source of truth is
 * `baseUrl` in docusaurus.config.js. Content must never hardcode the base path.
 *
 * @param {object} props
 * @param {string} props.to - Asset path relative to the site root, e.g. "skills/react/SKILL.md".
 * @param {string} [props.filename] - Suggested download filename. Defaults to the basename of `to`.
 * @param {React.ReactNode} props.children - Link label.
 */
export default function DownloadButton({to, filename, children}) {
  const href = useBaseUrl(to);
  const downloadName = filename ?? to.split('/').pop();
  return (
    <a href={href} download={downloadName}>
      {children}
    </a>
  );
}
