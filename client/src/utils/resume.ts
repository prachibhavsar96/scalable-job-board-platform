import { API_BASE_URL } from "../api/client";

export function getResumeUrl(resumePath?: string) {
  if (!resumePath) {
    return "";
  }

  if (resumePath.startsWith("http")) {
    return resumePath;
  }

  const normalizedPath = resumePath.startsWith("/")
    ? resumePath
    : `/${resumePath}`;

  return `${API_BASE_URL}${normalizedPath}`;
}

export function openResume(resumeUrl: string) {
  if (!resumeUrl) {
    return;
  }

  window.open(resumeUrl, "_blank", "noopener,noreferrer");
}

export function downloadResume(resumeUrl: string) {
  if (!resumeUrl) {
    return;
  }

  const link = document.createElement("a");
  link.href = resumeUrl;
  link.download = resumeUrl.split("/").pop() || "resume.pdf";
  link.target = "_blank";
  link.rel = "noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();
}
