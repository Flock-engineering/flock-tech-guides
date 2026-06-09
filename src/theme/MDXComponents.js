import MDXComponents from '@theme-original/MDXComponents';
import DownloadButton from '@site/src/components/DownloadButton';

// Register custom components globally so MDX pages can use them without imports.
export default {
  ...MDXComponents,
  DownloadButton,
};
