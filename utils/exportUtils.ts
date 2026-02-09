import { RetroItem, Column, User } from "../types";

export const convertToMarkdown = (
  sprintName: string,
  participants: User[],
  columns: Column[],
  items: RetroItem[],
): string => {
  let md = `# Retro Report: ${sprintName}\n\n`;

  md += `## Participants\n`;
  md += participants.map((p) => `- ${p.name} (${p.role})`).join("\n") + "\n\n";

  columns.forEach((col) => {
    const colItems = items.filter(
      (i) => i.column_id === col.id && !i.parent_id,
    );
    md += `## ${col.title}\n\n`;

    if (colItems.length === 0) {
      md += `*No items in this column.*\n\n`;
      return;
    }

    colItems.forEach((item) => {
      md += `### ${item.content}\n`;
      if (item.author_name) md += `*By: ${item.author_name}*\n`;

      const voteCount = Object.values(item.votes || {}).reduce(
        (a, b) => a + b,
        0,
      );
      if (voteCount > 0) md += `*Votes: ${voteCount}*\n`;

      // Comments
      if (item.comments && item.comments.length > 0) {
        md += `\n**Comments:**\n`;
        item.comments.forEach((c) => {
          md += `- ${c.text} (— *${c.author_name}*)\n`;
        });
      }

      // Action Items
      if (item.actionItems && item.actionItems.length > 0) {
        md += `\n**Action Items:**\n`;
        item.actionItems.forEach((ai) => {
          md += `- [${ai.isCompleted ? "x" : " "}] ${ai.text}\n`;
        });
      }

      // Grouped Sub-items
      const subItems = items.filter((i) => i.parent_id === item.id);
      if (subItems.length > 0) {
        md += `\n**Grouped Items:**\n`;
        subItems.forEach((si) => {
          md += `- ${si.content}\n`;
        });
      }

      md += `\n---\n\n`;
    });
  });

  return md;
};

export const downloadMarkdown = (content: string, filename: string) => {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// @ts-ignore
import html2pdf from "html2pdf.js";

export const triggerPrint = () => {
  window.print();
};

export const generatePDF = (
  sprintName: string,
  participants: User[],
  columns: Column[],
  items: RetroItem[],
) => {
  if (!html2pdf) {
    console.error("html2pdf library not found");
    return;
  }

  // Create a clean HTML structure for the PDF
  const element = document.createElement("div");
  element.style.padding = "40px";
  element.style.backgroundColor = "white";
  element.style.fontFamily = "sans-serif";
  element.style.color = "#172B4D";

  let html = `<h1 style="color: #0052CC; border-bottom: 2px solid #DEEBFF; padding-bottom: 10px; margin-bottom: 30px;">Retro Report: ${sprintName}</h1>`;

  html += `<div style="margin-bottom: 30px; background: #FAFBFC; padding: 20px; border-radius: 8px;">
    <h2 style="font-size: 16px; margin-top: 0; color: #42526E;">Participants</h2>
    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
      ${participants
        .map(
          (p) => `
        <span style="background: white; border: 1px solid #DFE1E6; padding: 4px 12px; rounded-radius: 4px; font-size: 12px;">
          <strong>${p.name}</strong> (${p.role})
        </span>
      `,
        )
        .join("")}
    </div>
  </div>`;

  columns.forEach((col) => {
    const colItems = items.filter(
      (i) => i.column_id === col.id && !i.parent_id,
    );
    html += `<div style="margin-bottom: 40px; page-break-inside: avoid;">
      <h2 style="display: flex; items-center; gap: 10px; font-size: 18px; border-left: 4px solid ${getColor(col.colorTheme)}; padding-left: 12px; margin-bottom: 20px;">
        ${col.title}
        <span style="font-size: 14px; font-weight: normal; color: #7A869A;">(${colItems.length} items)</span>
      </h2>`;

    if (colItems.length === 0) {
      html += `<p style="color: #7A869A; font-style: italic; font-size: 13px;">No items in this column.</p>`;
    } else {
      colItems.forEach((item) => {
        const votes = Object.values(item.votes || {}).reduce(
          (a, b) => a + b,
          0,
        );
        html += `<div style="margin-bottom: 20px; padding: 16px; border: 1px solid #DFE1E6; border-radius: 8px; background: white;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div style="font-weight: bold; font-size: 14px; flex: 1;">${item.content}</div>
            ${votes > 0 ? `<div style="background: #E3FCEF; color: #006644; font-size: 11px; font-weight: bold; padding: 2px 8px; border-radius: 12px;">${votes} votes</div>` : ""}
          </div>
          <div style="font-size: 11px; color: #7A869A; margin-bottom: 12px;">By: ${item.author_name || "Anonymous"}</div>`;

        if (item.comments && item.comments.length > 0) {
          html += `<div style="margin-top: 12px; border-top: 1px solid #F4F5F7; padding-top: 8px;">
            <div style="font-size: 11px; font-weight: bold; color: #42526E; margin-bottom: 4px;">Comments:</div>
            ${item.comments
              .map(
                (c) => `
              <div style="font-size: 12px; margin-bottom: 4px; color: #172B4D;">
                • ${c.text} <span style="color: #7A869A; font-size: 10px;">— ${c.author_name}</span>
              </div>
            `,
              )
              .join("")}
          </div>`;
        }

        if (item.actionItems && item.actionItems.length > 0) {
          html += `<div style="margin-top: 12px;">
            <div style="font-size: 11px; font-weight: bold; color: #42526E; margin-bottom: 4px;">Sub-actions:</div>
            ${item.actionItems
              .map(
                (ai) => `
              <div style="font-size: 12px; margin-bottom: 4px; color: ${ai.isCompleted ? "#36B37E" : "#172B4D"};">
                [${ai.isCompleted ? "✓" : " "}] ${ai.text}
              </div>
            `,
              )
              .join("")}
          </div>`;
        }

        html += `</div>`;
      });
    }
    html += `</div>`;
  });

  element.innerHTML = html;

  const opt = {
    margin: 10,
    filename: `retro-${sprintName.toLowerCase().replace(/\s+/g, "-")}.pdf`,
    image: { type: "jpeg" as const, quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: {
      unit: "mm",
      format: "a4" as const,
      orientation: "portrait" as const,
    },
  };

  html2pdf().from(element).set(opt).save();
};

const getColor = (theme: string) => {
  const colors: any = {
    green: "#36B37E",
    red: "#FF5630",
    blue: "#0052CC",
    yellow: "#FF991F",
    purple: "#6554C0",
    gray: "#7A869A",
  };
  return colors[theme] || "#0052CC";
};
