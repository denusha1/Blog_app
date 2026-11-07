import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

function videoSource(raw: string) {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return null;
    const host = url.hostname.toLowerCase();
    if (host === "youtu.be") return `https://www.youtube-nocookie.com/embed/${url.pathname.slice(1)}`;
    if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(host)) {
      const id = url.searchParams.get("v") ?? url.pathname.split("/embed/")[1]?.split("/")[0];
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (host === "vimeo.com" || host === "www.vimeo.com") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch { return null; }
  return null;
}

export function MarkdownBody({ content }: { content: string }) {
  return <div className="markdown-body"><ReactMarkdown
    remarkPlugins={[remarkGfm]}
    rehypePlugins={[rehypeSanitize]}
    components={{
      a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer noopener">{children}</a>,
      img: ({ src = "", alt = "" }) => {
        const source = typeof src === "string" ? src : "";
        if (alt.toLowerCase() === "video") {
          const embed = videoSource(source);
          if (embed) return <div className="video-frame"><iframe src={embed} title="Embedded video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>;
          if (/^https:\/\/.+\.(mp4|webm)(\?.*)?$/i.test(source)) return <video className="markdown-video" controls preload="metadata" src={source} />;
          return <a href={source} target="_blank" rel="noreferrer noopener">Watch video</a>;
        }
        return <img className="markdown-image" src={source} alt={alt} loading="lazy" />;
      },
      pre: ({ children }) => <pre className="code-block">{children}</pre>,
      code: ({ children, className }) => <code className={className}>{children}</code>,
      h1: ({ children }) => <h1 id={headingSlug(children)}>{children}</h1>,
      h2: ({ children }) => <h2 id={headingSlug(children)}>{children}</h2>,
      h3: ({ children }) => <h3 id={headingSlug(children)}>{children}</h3>,
    }}
  >{content}</ReactMarkdown></div>;
}

function headingSlug(children: React.ReactNode) { return String(children).toLowerCase().replace(/<[^>]*>/g, "").trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, ""); }
