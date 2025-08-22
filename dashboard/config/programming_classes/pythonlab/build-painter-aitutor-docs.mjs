import fs from "fs";
import path from "path";
import url from "url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* Created with help from ChatGPT */

function jsonToMarkdown(doc) {
  let md = `# ${doc.name}\n\n`;

  if (doc.content) {
    md += doc.content + "\n\n";
  }

  // Parse fields.
  if (doc.fields) {
    const fields = JSON.parse(doc.fields);
    if (fields.length > 0) {
      md += "## Fields\n\n";
      fields.forEach(f => {
        md += `- **\`${f.name}\`** (\`${f.type}\`) – ${f.description}\n`;
      });
      md += "\n";
    }
  }

  // Parse Methods.
  if (doc.methods && doc.methods.length > 0) {
    md += "## Methods\n\n";
    doc.methods
      .sort((a, b) => a.position - b.position)
      .forEach(method => {
        md += `### \`${method.name}()\`\n`;
        md += method.content ? method.content + "\n\n" : "";

        // Parameters
        if (method.parameters && method.parameters !== "[]") {
          const params = JSON.parse(method.parameters);
          if (params.length > 0) {
            md += "**Parameters:**\n";
            params.forEach(p => {
              md += `- **\`${p.name}\`** (\`${p.type}\`${p.required ? ", required" : ""}) – ${p.description}\n`;
            });
            md += "\n";
          }
        }

        // Examples
        if (method.examples && method.examples !== "[]") {
          const examples = JSON.parse(method.examples);
          examples.forEach(ex => {
            
            if (ex.code) {
              md += `${ex.name ? ex.name + "\n" : ""}${ex.code}\n\n`;
            }
          });
        }
      });
  }

  return md;
}

function escapeBackticks(str) {
  return str.replace(/`/g, '\\`');
}

/* Some markdown images are embeded in "code" within the JSON. */
function removeMarkdownImages(markdown) {
  // Matches ![alt](url "title") or ![](url)
  return markdown.replace(/!\[[^\]]*\]\([^)]*\)/g, '');
}

const doc = JSON.parse(fs.readFileSync(path.join(__dirname,"painter.json"), "utf8"));

const markdown = removeMarkdownImages(jsonToMarkdown(doc));
const markdownJs = `export const painterDocsMarkdown = \`${escapeBackticks(markdown)}\``;

const docsDir = path.join(__dirname, '../../../../apps/src/aiTutor/docs');

try{
  fs.mkdirSync(docsDir, { recursive: true });
  fs.writeFileSync(path.join(docsDir,"painter.md.js"), markdownJs);
  console.log("Markdown written to 'apps/src/aiTutor/docs/painter.md.js'");
}
catch {
    console.log("Failed writing markdown to apps/src/aiTutor/docs/painter.md.js");
}

 


