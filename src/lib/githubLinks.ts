/**
 * Generate a GitHub file link with optional line number
 * @param repoUrl - The GitHub repository URL (e.g., https://github.com/user/repo)
 * @param filePath - The file path relative to repo root (e.g., src/components/Modal.tsx)
 * @param line - Optional line number
 * @returns Full GitHub URL to the file/line, or null if inputs are invalid
 */
export function generateGitHubFileLink(
  repoUrl: string,
  filePath?: string,
  line?: number
): string | null {
  if (!repoUrl || !filePath) return null;

  // Clean the repo URL
  let cleanUrl = repoUrl.trim();
  
  // Remove trailing slash
  if (cleanUrl.endsWith('/')) {
    cleanUrl = cleanUrl.slice(0, -1);
  }
  
  // Remove .git suffix if present
  if (cleanUrl.endsWith('.git')) {
    cleanUrl = cleanUrl.slice(0, -4);
  }

  // Clean the file path (remove leading slash if present)
  const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;

  // Construct the blob URL (default to main branch)
  let url = `${cleanUrl}/blob/main/${cleanPath}`;

  // Add line anchor if provided
  if (line && line > 0) {
    url += `#L${line}`;
  }

  return url;
}
