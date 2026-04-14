"use client";

import type { TheoryContent, TheoryContentBlock } from "@/lib/types";

function blockTone(tone?: TheoryContentBlock["tone"]) {
  switch (tone) {
    case "warning":
      return "border-terra-300 bg-terra-50 text-terra-800";
    case "success":
      return "border-olive-300 bg-olive-50 text-olive-800";
    case "neutral":
      return "border-warm-300 bg-warm-50 text-warm-700";
    case "info":
    default:
      return "border-sky-300 bg-sky-50 text-sky-800";
  }
}

function renderYouTubeEmbed(url: string) {
  const id = url.includes("youtu.be/")
    ? url.split("youtu.be/")[1]?.split("?")[0]
    : url.split("v=")[1]?.split("&")[0];

  if (!id) return null;

  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl border border-warm-200 bg-white shadow-sm">
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title="Embedded video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  );
}

export default function TheoryContentRenderer({
  content,
}: {
  content: TheoryContent;
}) {
  const intro = typeof content.intro === "string" ? content.intro : "";
  const paragraphs = Array.isArray(content.paragraphs)
    ? content.paragraphs.filter(Boolean)
    : [];
  const bulletPoints = Array.isArray(content.bulletPoints)
    ? content.bulletPoints.filter(Boolean)
    : [];
  const examples = Array.isArray(content.examples)
    ? content.examples.filter((item) => item?.vlach || item?.greek)
    : [];
  const blocks = Array.isArray(content.blocks)
    ? content.blocks
    : [];

  return (
    <div className="space-y-8">
      {intro && (
        <p className="max-w-3xl text-base leading-8 text-warm-700">{intro}</p>
      )}

      {paragraphs.map((paragraph, index) => (
        <p key={`paragraph-${index}`} className="leading-8 text-warm-700">
          {paragraph}
        </p>
      ))}

      {bulletPoints.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-warm-800">Βασικά σημεία</h3>
          <ul className="list-disc space-y-2 pl-5 text-warm-700">
            {bulletPoints.map((point, index) => (
              <li key={`point-${index}`}>{point}</li>
            ))}
          </ul>
        </div>
      )}

      {examples.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {examples.map((example, index) => (
            <div
              key={`example-${index}`}
              className="rounded-2xl border border-warm-200 bg-white px-5 py-4"
            >
              {example.title && (
                <p className="mb-2 text-sm font-medium text-warm-500">
                  {example.title}
                </p>
              )}
              {example.vlach && (
                <p className="vlach-text text-lg leading-7">{example.vlach}</p>
              )}
              {example.greek && (
                <p className="mt-1 text-sm leading-6 text-warm-600">
                  {example.greek}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <div key={index}>
              <h3 className="text-xl font-semibold text-warm-800">
                {block.title || block.text}
              </h3>
            </div>
          );
        }

        if (block.type === "paragraph") {
          return (
            <p key={index} className="leading-8 text-warm-700">
              {block.text}
            </p>
          );
        }

        if (block.type === "callout") {
          return (
            <div
              key={index}
              className={`rounded-2xl border px-5 py-4 ${blockTone(block.tone)}`}
            >
              {block.title && (
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide">
                  {block.title}
                </p>
              )}
              <p className="leading-7">{block.text}</p>
            </div>
          );
        }

        if (block.type === "bullet_list" || block.type === "numbered_list") {
          const Tag = block.type === "numbered_list" ? "ol" : "ul";
          const listClass =
            block.type === "numbered_list"
              ? "list-decimal pl-5"
              : "list-disc pl-5";
          return (
            <div key={index} className="space-y-3">
              {block.title && (
                <h3 className="text-lg font-semibold text-warm-800">
                  {block.title}
                </h3>
              )}
              <Tag className={`${listClass} space-y-2 text-warm-700`}>
                {block.items?.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </Tag>
            </div>
          );
        }

        if (block.type === "example_pair") {
          return (
            <div
              key={index}
              className="rounded-2xl border border-warm-200 bg-white px-5 py-4"
            >
              {block.title && (
                <p className="mb-2 text-sm font-medium text-warm-500">
                  {block.title}
                </p>
              )}
              {block.vlach && (
                <p className="vlach-text text-lg leading-7">{block.vlach}</p>
              )}
              {block.greek && (
                <p className="mt-1 text-sm leading-6 text-warm-600">
                  {block.greek}
                </p>
              )}
            </div>
          );
        }

        if (block.type === "table") {
          const columns =
            block.columns && block.columns.length > 0
              ? block.columns
              : Object.keys(block.rows?.[0] || {});

          return (
            <div key={index} className="space-y-3">
              {block.title && (
                <h3 className="text-lg font-semibold text-warm-800">
                  {block.title}
                </h3>
              )}
              <div className="overflow-x-auto rounded-2xl border border-warm-200 bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-warm-50 text-left text-warm-700">
                      {columns.map((column) => (
                        <th key={column} className="px-4 py-3 font-medium">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warm-100">
                    {block.rows?.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-warm-50/60">
                        {columns.map((column) => (
                          <td key={column} className="px-4 py-3 align-top">
                            {row[column]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }

        if (block.type === "dialogue") {
          return (
            <div
              key={index}
              className="rounded-2xl border border-warm-200 bg-white px-5 py-5"
            >
              {block.title && (
                <h3 className="mb-4 text-lg font-semibold text-warm-800">
                  {block.title}
                </h3>
              )}
              <div className="space-y-3">
                {block.lines?.map((line, lineIndex) => (
                  <div key={lineIndex} className="grid gap-1 sm:grid-cols-[96px_1fr]">
                    <p className="text-sm font-medium text-warm-500">
                      {line.speaker || ""}
                    </p>
                    <div>
                      <p className="vlach-text leading-7">{line.text}</p>
                      {line.greek && (
                        <p className="mt-1 text-sm text-warm-600">
                          {line.greek}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        if (block.type === "youtube" && block.url) {
          return (
            <div key={index} className="space-y-3">
              {block.title && (
                <h3 className="text-lg font-semibold text-warm-800">
                  {block.title}
                </h3>
              )}
              {renderYouTubeEmbed(block.url)}
              {block.caption && (
                <p className="text-sm text-warm-500">{block.caption}</p>
              )}
            </div>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote
              key={index}
              className="rounded-2xl border-l-4 border-sky-300 bg-white px-5 py-4 text-warm-700 shadow-sm"
            >
              <p className="leading-8">{block.text}</p>
            </blockquote>
          );
        }

        return null;
      })}
    </div>
  );
}
